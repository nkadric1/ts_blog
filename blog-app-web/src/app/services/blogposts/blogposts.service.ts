import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BlogPost, BlogPostCreate } from 'src/app/models/blogposts.model';
import { EditBlogPostRequest } from 'src/app/models/edit-blog-post-request.model';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class BlogpostsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders | undefined {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  createBlogPost(model: BlogPostCreate) {
    return this.http.post(`${this.apiUrl}/BlogPost`, model, {
      observe: 'response',
      headers: this.authHeaders()
    });
  }

  getBlogPosts(page = 1) {
    return this.http.get(`${this.apiUrl}/BlogPost?page=${page}`, {
      headers: this.authHeaders()
    });
  }

  getVisibleBlogPosts(page = 1) {
    return this.http.get(`${this.apiUrl}/BlogPost/Visible?page=${page}`);
  }

  getMyBlogPosts(page = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/BlogPost/mine?page=${page}`, {
      headers: this.authHeaders()
    });
  }

  deleteBlogPost(id: string) {
    return this.http.delete(`${this.apiUrl}/BlogPost/${id}`, {
      headers: this.authHeaders()
    });
  }

  getBlogPost(id: string): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/BlogPost/${id}`, {
      headers: this.authHeaders()
    });
  }

getBlogPostByUrlHandle(urlHandle: string): Observable<BlogPost> {
  return this.http.get<BlogPost>(
    `${this.apiUrl}/BlogPost/by-url/${encodeURIComponent(urlHandle)}`
  );
}


  editBlogPost(id: string, blogpost: EditBlogPostRequest): Observable<any> {
    return this.http.put(`${this.apiUrl}/BlogPost/${id}`, blogpost, {
      headers: this.authHeaders()
    });
  }
}
