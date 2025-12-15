import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AddCommentDto, CommentGetDto } from '../models/comment.model';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth/auth.service';

@Injectable({ providedIn: 'root' })
export class CommentService {

  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private authHeaders(): HttpHeaders | undefined {
    const token = this.auth.getToken();
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
  }

  getByBlog(blogPostId: string): Observable<CommentGetDto[]> {
    return this.http.get<CommentGetDto[]>(
      `${this.apiUrl}/Comments/blog/${blogPostId}`
    );
  }

  add(dto: AddCommentDto): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/Comments`,
      dto,
      { headers: this.authHeaders() }
    );
  }

  delete(commentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/Comments/${commentId}`,
      { headers: this.authHeaders() }
    );
  }
}
