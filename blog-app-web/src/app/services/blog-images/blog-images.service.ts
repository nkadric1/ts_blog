import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BlogImage } from 'src/app/models/blog-image.model';
import { environment } from 'src/environments/environment';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class BlogImagesService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  uploadImage(file: File, fileName: string, title: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('fileName', fileName);
    formData.append('title', title);

    const token = this.auth.getToken();

    const headers = token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;

    return this.http.post(`${environment.apiUrl}/BlogImages/Upload`, formData, { headers });
  }

  getBlogImages(): Observable<BlogImage[]> {
    return this.http.get<BlogImage[]>(`${environment.apiUrl}/BlogImages`);
  }
}
