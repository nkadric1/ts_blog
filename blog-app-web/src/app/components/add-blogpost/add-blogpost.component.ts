import { BlogPostCreate } from 'src/app/models/blogposts.model';
import { BlogpostsService } from 'src/app/services/blogposts/blogposts.service';
import { Observable, Subject, Subscription, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { Category } from 'src/app/models/categories.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BlogImagePost } from 'src/app/models/blog-image-post.model';
import { BlogImagesService } from 'src/app/services/blog-images/blog-images.service';
import { ChangeDetectorRef, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-add-blogpost',
  templateUrl: './add-blogpost.component.html',
  styleUrls: ['./add-blogpost.component.css'],
  providers: [BlogpostsService, CategoriesService, AuthService],
})
export class AddBlogpostComponent implements OnInit {
  blogPost: BlogPostCreate = {
    title: '',
    shortDescription: '',
    content: '',
    featureImageUrl: '',
    urlHandle: '',
    publishDate: new Date(),
    author: '',
    isVisible: false,
    categories: [],
  };
  categories: Category[] = [];
  private destroy$ = new Subject<void>();
  availableCategories: any;
  blogImages$!: Observable<Array<BlogImagePost>>;
  selectedFile: File | null = null;
  fileName: string = '';
  title: string = '';

  private subscription!: Subscription;
  private uploadSubscription?: Subscription;

  @ViewChild('imageModal') imageModal!: ElementRef;
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
    }

    this.getCategories();
    this.blogImages$ = this.blogImageService.getBlogImages();
  }

  getCategories(): void {
    this.categoriesService.getCategories().subscribe((response: any) => {
      this.categories = response;
    });
  }

  onCategoryChange(event: Event): void {
    const selectedOptions = (event.target as HTMLSelectElement).selectedOptions;
    this.blogPost.categories = [];

    for (let i = 0; i < selectedOptions.length; i++) {
      this.blogPost.categories.push(selectedOptions[i].value);
    }
  }

  updateSelectedCategories(event: Event, categoryName: string): void {
    const checkbox = event.target as HTMLInputElement;
    if (checkbox.checked) {
      this.blogPost.categories.push(categoryName);
    } else {
      this.blogPost.categories = this.blogPost.categories.filter(cat => cat !== categoryName);
    }
  }

  isCategorySelected(categoryId: string): boolean {
    return this.blogPost.categories.includes(categoryId);
  }

  SubmitImageForm(): void {
    if (this.selectedFile && this.fileName && this.title) {
      this.uploadSubscription = this.blogImageService.uploadImage(this.selectedFile, this.fileName, this.title)
        .subscribe({
          next: (response) => {
            if (response && response.filePath) {
              this.blogPost.featureImageUrl = response.filePath;
              this.blogImages$ = this.blogImageService.getBlogImages();
              
              this.closeModal();
            } else {
              console.error('Upload response does not contain filePath:', response);
            }
          },
          error: (error) => {
            console.error('Error uploading image:', error);
            window.alert('Use an image with an extension that is either .png, .jpg. or .jpeg!');
          }
        });
    } else {
      window.alert('File, file name, or title is missing.!')
      console.error('File, file name, or title is missing.');
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onImageClick(url: string | undefined): void {
    this.blogPost.featureImageUrl = url ?? '';
    this.closeModal();
  }

createBlogPost(): void {
  const d = new Date(this.blogPost.publishDate as any);
  this.blogPost.publishDate = new Date(Date.UTC(
    d.getFullYear(),
    d.getMonth(),
    d.getDate()
  )) as any;

  this.blogPostService.createBlogPost(this.blogPost).subscribe({
    next: (res) => {
      if (res.status === 201 || res.status === 200) {
        alert('Blog post created successfully');
        this.router.navigate(['/admin/blogposts']);
      } else {
        alert('Created, but unexpected status: ' + res.status);
      }
    },
    error: (err) => {
      console.error(err);
      alert(err?.error?.message ?? 'Error creating blog post');
    }
  });
}



  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private closeModal(): void {
    const modalElement = this.imageModal.nativeElement;
    modalElement.classList.remove('show');
    modalElement.setAttribute('aria-hidden', 'true');
    modalElement.style.display = 'none';
  
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }
  const uploadButton = document.querySelector('button[data-bs-target="#imageModal"]')  as HTMLElement;;
  if (uploadButton) {
      uploadButton.blur(); 
  }
    document.body.classList.remove('modal-open');
    document.documentElement.style.overflow= 'auto';
  }
}