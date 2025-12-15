import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UpdateUserProfile, UserProfile } from '../models/user-profile.model';
import { AuthService } from './auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private apiUrl: string = environment.apiUrl;

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

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(
      `${this.apiUrl}/Auth/profile`,
      { headers: this.authHeaders() }
    );
  }

  updateProfile(model: UpdateUserProfile): Observable<any> {
    return this.http.put<any>(
      `${this.apiUrl}/Auth/profile`,
      model,
      { headers: this.authHeaders() }
    );
  }
}
