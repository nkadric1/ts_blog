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

  markdownContent: string = '';
  blogImages$!: Observable<Array<BlogImagePost>>;

  selectedFile: File | null = null;
  fileName: string = '';
  title: string = '';
declare  bootstrap: any;

  @ViewChild('imageModal') imageModal!: ElementRef;

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

  private fetchBlogPost(id: string): void {
    this.blogPostService.getBlogPost(id).subscribe(res => {
      this.blogPost = res;

      this.markdownContent = this.blogPost.content ?? '';

      this.selectedCategories = (this.blogPost.categories ?? []).map((c: any) => c.id ?? c);

      this.blogPost.featureImageUrl = this.toRelativeUrl(this.blogPost.featureImageUrl);
    });
  }

  private loadCategories(): void {
    this.categoryService.getCategories().subscribe((response: any) => {
      this.categories = response;
    });
  }

  updateMarkdown(content: string): void {
    this.markdownContent = content;
  }

  onFormSubmit(): void {
    if (!this.blogPost) return;

    const d = new Date(this.blogPost.publishDate as any);
    const publishUtc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    const request: EditBlogPostRequest = {
      title: this.blogPost.title,
      shortDescription: this.blogPost.shortDescription,
      content: this.blogPost.content,

      featureImageUrl: this.toRelativeUrl(this.blogPost.featureImageUrl),

      urlHandle: this.blogPost.urlHandle,
      publishDate: publishUtc as any,
      author: this.blogPost.author,
      isVisible: this.blogPost.isVisible,

      categories: this.selectedCategories
    };

    this.updateBlogPostSubscription = this.blogPostService
      .editBlogPost(this.id, request)
      .subscribe({
        next: () => this.router.navigateByUrl('/admin/blogposts'),
        error: (err) => {
          console.error(err);
          alert(err?.error?.message ?? 'Error updating blog post');
        }
      });
  }

  SubmitImageForm(): void {
    if (!this.selectedFile || !this.fileName || !this.title) {
      window.alert('File, file name, or title is missing.');
      return;
    }

    this.uploadSubscription = this.blogImageService
      .uploadImage(this.selectedFile, this.fileName, this.title)
      .subscribe({
        next: (response: any) => {
          const raw = response?.filePath ?? response?.url ?? '';
          if (!raw) {
            console.error('Upload response does not contain filePath/url:', response);
            return;
          }

          if (this.blogPost) this.blogPost.featureImageUrl = this.toRelativeUrl(raw);
          this.blogImages$ = this.blogImageService.getBlogImages();
          this.closeModal();
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          window.alert('Use .png, .jpg or .jpeg!');
        }
      });
  }

  onFileSelected(event: any): void {
    const file = event?.target?.files?.[0];
    if (file) this.selectedFile = file;
  }

  onImageClick(url: string | undefined): void {
    if (!this.blogPost) return;
    this.blogPost.featureImageUrl = this.toRelativeUrl(url ?? '');
    this.closeModal();
  }

  private toRelativeUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('/')) return url;

    try {
      const u = new URL(url);
      return u.pathname;
    } catch {
      return url;
    }
  }

private closeModal(): void {
  const el = this.imageModal?.nativeElement as HTMLElement;
  if (!el) return;

  (document.activeElement as HTMLElement | null)?.blur();

  const instance = this.bootstrap.Modal.getInstance(el) || new this.bootstrap.Modal(el);
  instance.hide();
}
  ngOnDestroy(): void {
    this.paramsSubscription?.unsubscribe();
    this.updateBlogPostSubscription?.unsubscribe();
    this.uploadSubscription?.unsubscribe();
  }
}
