import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


import { environment } from 'src/environments/environment.staging';
import { UpdateUserProfile, UserProfile } from '../models/user-profile.model';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/Auth/profile`);
  }

  updateProfile(model: UpdateUserProfile): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Auth/profile`, model);
  }
}
