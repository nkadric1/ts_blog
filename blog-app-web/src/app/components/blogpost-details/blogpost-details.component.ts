import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BlogPost } from 'src/app/models/blogposts.model';
import { AuthService } from 'src/app/services/auth/auth.service';
import { BlogpostsService } from 'src/app/services/blogposts/blogposts.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-blogpost-details',
  templateUrl: './blogpost-details.component.html',
  styleUrls: ['./blogpost-details.component.css'],
  providers: [BlogpostsService],
})
export class BlogpostDetailsComponent implements OnInit {
  constructor(
    private blogPostService: BlogpostsService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  blogPost: BlogPost = {
    id: '',
    title: '',
    content: '',
    shortDescription: '',
    featureImageUrl: '',
    author: '',
    isVisible: true,
    urlHandle: '',
    publishDate: new Date(),
    categories: [],
  };

  apiBaseUrl = environment.apiUrl.replace('/api', '');

  comments: { author: string; text: string; date: Date }[] = [];
  newComment = { author: '', text: '' };

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const urlHandle = params.get('urlHandle');
      if (urlHandle) {
        this.getBlogPost(urlHandle);
      }
      console.log(this.authService.getToken());

    });

    //Optionally auto-fill author if user is logged in
    //const currentUser = this.authService.getUser();
    //if (currentUser && currentUser.name) {
      //this.newComment.author = currentUser.name;
   // }
  }
getImageSrc(url?: string | null): string {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) return url;

  const normalized = url.startsWith('/') ? url : `/${url}`;

  if (normalized.startsWith('/http')) return url;

  return `${this.apiBaseUrl}${normalized}`;
}



getBlogPost(urlHandle: string) {
  this.blogPostService.getBlogPostByUrlHandle(urlHandle).subscribe((response: any) => {
    console.log('featureImageUrl from API:', response?.featureImageUrl);
    this.blogPost = response;
  });
}


  addComment() {
    if (this.newComment.author.trim() && this.newComment.text.trim()) {
      this.comments.push({
        author: this.newComment.author,
        text: this.newComment.text,
        date: new Date(),
      });
      this.newComment.text = '';
    }
  }
}
