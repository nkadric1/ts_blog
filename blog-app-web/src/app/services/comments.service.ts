import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddCommentDto, CommentGetDto } from '../models/comment.model';
import { environment } from 'src/environments/environment.staging';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getByBlog(blogPostId: string): Observable<CommentGetDto[]> {
    return this.http.get<CommentGetDto[]>(
      `${this.apiUrl}/Comments/blog/${blogPostId}`
    );
  }

  add(dto: AddCommentDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/Comments`, dto);
  }

  delete(commentId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Comments/${commentId}`);
  }
}
