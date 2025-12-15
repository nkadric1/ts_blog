import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';

import { BlogPostCreate } from 'src/app/models/blogposts.model';
import { Category } from 'src/app/models/categories.model';
import { BlogImagePost } from 'src/app/models/blog-image-post.model';

import { BlogpostsService } from 'src/app/services/blogposts/blogposts.service';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { BlogImagesService } from 'src/app/services/blog-images/blog-images.service';
import { AuthService } from 'src/app/services/auth/auth.service';

import { environment } from 'src/environments/environment';

declare const bootstrap: any;

@Component({
  selector: 'app-add-blogpost',
  templateUrl: './add-blogpost.component.html',
  styleUrls: ['./add-blogpost.component.css'],
})
export class AddBlogpostComponent implements OnInit, OnDestroy {

  blogPost: BlogPostCreate = {
    title: '',
    shortDescription: '',
    content: '',
    featureImageUrl: '',
    urlHandle: '',
    publishDate: new Date(),
    author: '', // backend će ga setovati iz tokena
    isVisible: false,
    categories: [],
  };

  categories: Category[] = [];
  blogImages$!: Observable<Array<BlogImagePost>>;

  selectedFile: File | null = null;
  fileName: string = '';
  title: string = '';

  private uploadSubscription?: Subscription;
  private destroy$ = new Subject<void>();

  @ViewChild('imageModal') imageModal!: ElementRef;

  // npr: https://localhost:7156/api  -> https://localhost:7156
  apiBaseUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private blogPostService: BlogpostsService,
    private categoriesService: CategoriesService,
    private authService: AuthService,
    private blogImageService: BlogImagesService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadCategories();
    this.blogImages$ = this.blogImageService.getBlogImages();
  }

  ngOnDestroy(): void {
    this.uploadSubscription?.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCategories(): void {
    this.categoriesService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response;
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message ?? 'Error loading categories');
      }
    });
  }

  onCategoryChange(event: Event): void {
    const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
    this.blogPost.categories = [];

    for (let i = 0; i < selectedOptions.length; i++) {
      this.blogPost.categories.push(selectedOptions[i].value);
    }
  }

  // ✅ ZA UI PREVIEW
  getImageSrc(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const path = url.startsWith('/') ? url : `/${url}`;
    return `${this.apiBaseUrl}${path}`;
  }

  // ✅ ZA BACKEND (uvijek relativno: /images/...)
  private toRelativeUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('/')) return url;

    try {
      const u = new URL(url);
      return u.pathname; // "/images/flower.jpg"
    } catch {
      return url.startsWith('images/') ? `/${url}` : url;
    }
  }

  submitImageForm(): void {
    if (!this.selectedFile || !this.fileName || !this.title) {
      alert('File, name or title missing');
      return;
    }

    this.uploadSubscription = this.blogImageService
      .uploadImage(this.selectedFile, this.fileName, this.title)
      .subscribe({
        next: (res: any) => {
          const url = res?.filePath || res?.url;
          if (!url) {
            console.error('Invalid upload response', res);
            alert('Upload response is missing url/filePath');
            return;
          }

          // čuvaj kako backend vrati (često full url)
          this.blogPost.featureImageUrl = url;

          this.selectedFile = null;
          this.fileName = '';
          this.title = '';

          this.blogImages$ = this.blogImageService.getBlogImages();
          this.closeModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert(err?.error?.message ?? 'Upload failed (only .png, .jpg, .jpeg allowed)');
        }
      });
  }

  onFileSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (file) this.selectedFile = file;
  }

  onImageClick(url?: string): void {
    if (!url) return;
    this.blogPost.featureImageUrl = url;
    this.closeModal();
  }

  createBlogPost(): void {
    const d = new Date(this.blogPost.publishDate as any);
    this.blogPost.publishDate = new Date(Date.UTC(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    )) as any;

    // ✅ backend neka dobije relativni path
    this.blogPost.featureImageUrl = this.toRelativeUrl(this.blogPost.featureImageUrl);

    // author ne šalji / ostavi prazno (backend ga već setuje)
    this.blogPost.author = '';

    this.blogPostService.createBlogPost(this.blogPost).subscribe({
      next: () => {
        this.router.navigate(['/blogposts']);
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message ?? 'Error creating blog post');
      }
    });
  }

  private closeModal(): void {
    const el = this.imageModal?.nativeElement as HTMLElement;
    if (!el) return;

    (document.activeElement as HTMLElement | null)?.blur();

    const instance = bootstrap.Modal.getOrCreateInstance(el);
    instance.hide();
  }
}
