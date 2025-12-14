import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { BlogPost } from 'src/app/models/blogposts.model';
import { BlogpostsService } from 'src/app/services/blogposts/blogposts.service';
import { jwtDecode } from 'jwt-decode';
import { DecodedToken } from 'src/app/models/token.model';
import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment.staging';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [BlogpostsService]
})
export class HomeComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  pages: number = 1;
  page: number = 1;

  private destroy$ = new Subject<void>();

  apiBaseUrl = environment.apiUrl.replace('/api', '');

  constructor(private blogPostService: BlogpostsService, private router: Router) { }

  ngOnInit(): void {
    this.getBlogPosts();
  }

  getBlogPosts(page: number = 1): void {
    this.blogPostService
      .getVisibleBlogPosts(page)
      .subscribe((response: any) => {
        this.blogPosts = response.blogPosts;
        this.pages = response.page;
      });
  }

  nextPage(): void {
    this.page++;
    this.getBlogPosts(this.page);
  }

  previousPage(): void {
    this.page--;
    this.getBlogPosts(this.page);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  goToProfile(): void {
  this.router.navigate(['/profile']);
}

}