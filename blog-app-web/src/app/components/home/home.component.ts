import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { BlogPost } from 'src/app/models/blogposts.model';
import { BlogpostsService } from 'src/app/services/blogposts/blogposts.service';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth/auth.service'; // provjeri putanju

type TabKey = 'all' | 'mine';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [BlogpostsService]
})
export class HomeComponent implements OnInit, OnDestroy {
  blogPosts: BlogPost[] = [];

  myBlogPosts: BlogPost[] = [];
  displayedPosts: BlogPost[] = [];

  pages: number = 1;
  page: number = 1;

  activeTab: TabKey = 'all';

  private destroy$ = new Subject<void>();

  apiBaseUrl = environment.apiUrl.replace('/api', '');

  private myUsername: string | null = null;

  constructor(
    private blogPostService: BlogpostsService,
    private router: Router,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadIdentityFromToken();
    this.getBlogPosts();
  }

  private loadIdentityFromToken(): void {
    const token = this.auth.getToken();
    if (!token) {
      this.myUsername = null;
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      this.myUsername =
        decoded?.sub ??
        decoded?.unique_name ??
        decoded?.name ??
        decoded?.username ??
        null;
    } catch (e) {
      console.error('JWT decode failed', e);
      this.myUsername = null;
    }
  }

  setTab(tab: TabKey): void {
    this.activeTab = tab;
    this.updateDerivedLists();
  }

  getBlogPosts(page: number = 1): void {
    this.blogPostService.getVisibleBlogPosts(page).subscribe({
      next: (response: any) => {
        this.blogPosts = response?.blogPosts ?? [];
        this.pages = response?.page ?? 1;
        this.updateDerivedLists();
      },
      error: (err) => {
        console.error(err);
        alert(err?.error?.message ?? 'Failed to load blog posts');
      }
    });
  }

  private updateDerivedLists(): void {
    if (this.myUsername) {
      const me = this.myUsername.toLowerCase();
      this.myBlogPosts = this.blogPosts.filter((b: any) => {
        const author = (b?.author ?? '').toString().toLowerCase();
        return author === me;
      });
    } else {
      this.myBlogPosts = [];
    }

    this.displayedPosts = this.activeTab === 'mine' ? this.myBlogPosts : this.blogPosts;
  }

  nextPage(): void {
    this.page++;
    this.getBlogPosts(this.page);
  }

  previousPage(): void {
    this.page--;
    this.getBlogPosts(this.page);
  }

  openDetails(blog: BlogPost): void {
    const handle = (blog as any)?.urlHandle;
    if (!handle) return;
    this.router.navigate(['/blog', handle]);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  getImageSrc(url?: string | null): string {
    if (!url) return '';
      if (url.startsWith('seed/')) return 'assets/placeholder.png';

    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    const path = url.startsWith('/') ? url : `/${url}`;
    return `${this.apiBaseUrl}${path}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
    isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }
}
