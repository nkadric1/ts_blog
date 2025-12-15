import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { BlogImagePost } from 'src/app/models/blog-image-post.model';
import { BlogPost } from 'src/app/models/blogposts.model';
import { Category } from 'src/app/models/categories.model';
import { EditBlogPostRequest } from 'src/app/models/edit-blog-post-request.model';
import { BlogImagesService } from 'src/app/services/blog-images/blog-images.service';
import { BlogpostsService } from 'src/app/services/blogposts/blogposts.service';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { environment } from 'src/environments/environment';

declare const bootstrap: any;

@Component({
  selector: 'app-edit-blog-post',
  templateUrl: './edit-blogpost.component.html',
  styleUrls: ['./edit-blogpost.component.css']
})
export class EditBlogPostComponent implements OnInit, OnDestroy {
  id: string = '';
  blogPost?: BlogPost;

  categories: Category[] = [];
  selectedCategories: string[] = [];

  paramsSubscription?: Subscription;
  updateBlogPostSubscription?: Subscription;
  private uploadSubscription?: Subscription;
  private getBlogPostSubscription?: Subscription;
  private getCategoriesSubscription?: Subscription;

  markdownContent: string = '';
  blogImages$!: Observable<Array<BlogImagePost>>;

  selectedFile: File | null = null;
  fileName: string = '';
  title: string = '';

  @ViewChild('imageModal') imageModal!: ElementRef;

  // npr: https://localhost:7156/api  -> https://localhost:7156
  apiBaseUrl = environment.apiUrl.replace('/api', '');

  constructor(
    private route: ActivatedRoute,
    private blogPostService: BlogpostsService,
    private categoryService: CategoriesService,
    private blogImageService: BlogImagesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.blogImages$ = this.blogImageService.getBlogImages();
    this.loadCategories();

    this.paramsSubscription = this.route.paramMap.subscribe(params => {
      this.id = params.get('id') ?? '';
      if (this.id) this.fetchBlogPost(this.id);
    });
  }

  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
    this.updateBlogPostSubscription?.unsubscribe();
    this.uploadSubscription?.unsubscribe();
    this.getBlogPostSubscription?.unsubscribe();
    this.getCategoriesSubscription?.unsubscribe();
  }

  private fetchBlogPost(id: string): void {
    this.getBlogPostSubscription = this.blogPostService.getBlogPost(id).subscribe({
      next: (res) => {
        this.blogPost = res;

        this.markdownContent = this.blogPost.content ?? '';
        this.selectedCategories = (this.blogPost.categories ?? []).map((c: any) => c?.id ?? c);
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message ?? 'Error loading blog post');
      }
    });
  }

  private loadCategories(): void {
    this.getCategoriesSubscription = this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        this.categories = response;
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message ?? 'Error loading categories');
      }
    });
  }

  updateMarkdown(content: string): void {
    this.markdownContent = content;
  }

  // ✅ ZA UI: da preview uvijek radi (i kad je /images/... i kad je https://...)
  getImageSrc(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const path = url.startsWith('/') ? url : `/${url}`;
    return `${this.apiBaseUrl}${path}`;
  }

  // ✅ ZA BACKEND: šalji uvijek relativno (/images/...)
  private toRelativeUrl(url?: string | null): string {
    if (!url) return '';
    if (url.startsWith('/')) return url;

    try {
      // ako je full url, vrati samo path
      const u = new URL(url);
      return u.pathname; // npr "/images/flower.jpg"
    } catch {
      // fallback: tretiraj kao path
      return url.startsWith('images/') ? `/${url}` : url;
    }
  }

  onFormSubmit(): void {
    if (!this.blogPost) return;

    const d = new Date(this.blogPost.publishDate as any);
    const publishUtc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    const request: EditBlogPostRequest = {
      title: this.blogPost.title,
      shortDescription: this.blogPost.shortDescription,
      content: this.blogPost.content,

      // ✅ backend dobija RELATIVNO
      featureImageUrl: this.toRelativeUrl(this.blogPost.featureImageUrl),

      urlHandle: this.blogPost.urlHandle,
      publishDate: publishUtc as any,

      // author nemoj mijenjati (backend ga ionako čuva)
      author: this.blogPost.author,

      isVisible: this.blogPost.isVisible,
      categories: this.selectedCategories
    };

    this.updateBlogPostSubscription = this.blogPostService
      .editBlogPost(this.id, request)
      .subscribe({
        next: () => this.router.navigateByUrl('blogposts'),
        error: (err) => {
          console.error(err);
          alert(err?.error?.message ?? 'Error updating blog post');
        }
      });
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

          // ✅ čuvaj kako backend vrati (najčešće full url)
          if (this.blogPost) this.blogPost.featureImageUrl = url;

          this.selectedFile = null;
          this.fileName = '';
          this.title = '';

          this.blogImages$ = this.blogImageService.getBlogImages();
          this.closeModal();
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
    if (!url || !this.blogPost) return;
    this.blogPost.featureImageUrl = url;
    this.closeModal();
  }

  private closeModal(): void {
    const el = this.imageModal?.nativeElement as HTMLElement;
    if (!el) return;

    (document.activeElement as HTMLElement | null)?.blur();

    const instance = bootstrap.Modal.getOrCreateInstance(el);
    instance.hide();
  }
}
