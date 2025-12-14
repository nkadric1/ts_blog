import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BlogPost, BlogPostCreate, BlogPostListResponse } from 'src/app/models/blogposts.model';
import { EditBlogPostRequest } from 'src/app/models/edit-blog-post-request.model';
import { environment } from 'src/environments/environment.staging';

@Injectable({
  providedIn: 'root',
})
export class BlogpostsService {
 

  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;


createBlogPost(model: BlogPostCreate) {
  return this.http.post(`${this.apiUrl}/BlogPost`, model, { observe: 'response' });
}

getBlogPosts(page = 1) {
  return this.http.get(`${this.apiUrl}/BlogPost?page=${page}`);
}

getVisibleBlogPosts(page = 1) {
  return this.http.get(`${this.apiUrl}/BlogPost/Visible?page=${page}`);
}

deleteBlogPost(id: string) {
  return this.http.delete(`${this.apiUrl}/BlogPost/${id}`);
}

  getBlogPost(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/BlogPost/${id}`);
  }

  getBlogPostByUrlHandle(urlHandle: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/BlogPost/${urlHandle}`);
  }


  editBlogPost(id: string, blogpost: EditBlogPostRequest): Observable<any> {
  return this.http.put(`${this.apiUrl}/BlogPost/${id}`, blogpost);
  }

}