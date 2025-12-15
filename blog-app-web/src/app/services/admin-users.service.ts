import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth/auth.service';
import { AdminUser } from '../models/admin-user.model';

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private authHeaders(): HttpHeaders | undefined {
    const token = this.auth.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(
      `${environment.apiUrl}/Users`,
      { headers: this.authHeaders() }
    );
  }

  deleteUser(id: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/Users/${id}`,
      { headers: this.authHeaders() }
    );
  }
}
