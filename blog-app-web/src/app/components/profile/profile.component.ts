import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserProfile } from 'src/app/models/user-profile.model';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  user?: UserProfile;
  loading = true;
  error?: string;

  constructor(
    private profileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load profile.';
        this.loading = false;
      },
    });
  }

  goToEdit(): void {
    this.router.navigate(['/profile/edit']);
  }

  getInitials(): string {
    if (!this.user) return '';
    if (this.user.fullName && this.user.fullName.trim().length > 0) {
      return this.user.fullName
        .split(' ')
        .map((p) => p[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
    }
    return (this.user.email || '?').charAt(0).toUpperCase();
  }
}
