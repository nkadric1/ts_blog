import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserProfileService } from 'src/app/services/user-profile.service';
import {
  UpdateUserProfile,
  UserProfile,
} from 'src/app/models/user-profile.model';
import { FileUploadService } from 'src/app/services/file-upload.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css'],
})
export class EditProfileComponent implements OnInit {
  form!: FormGroup;
  loading = true;
  saving = false;
  error = '';
  user?: UserProfile;

  constructor(
    private fb: FormBuilder,
    private profileService: UserProfileService,
    private router: Router,
    private uploadService: FileUploadService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      bio: [''],
      profileImageUrl: [''],
    });

    this.profileService.getProfile().subscribe({
      next: (profile) => {
        this.user = profile;
        this.form.patchValue({
          fullName: profile.fullName,
          bio: profile.bio,
          profileImageUrl: profile.profileImageUrl,
        });
        this.loading = false;
      },
      error: () => {
        this.error = 'Unable to load profile.';
        this.loading = false;
      },
    });
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];

    this.uploadService.uploadImage(file).subscribe({
      next: (res) => {
        this.form.patchValue({
          profileImageUrl: res.url,
        });
      },
      error: () => {
        alert('Image upload failed');
      },
    });
  }

  save(): void {
    if (this.form.invalid) return;

    const model: UpdateUserProfile = this.form.value;

    this.saving = true;
    this.error = '';

    this.profileService.updateProfile(model).subscribe({
      next: () => {
        this.saving = false;
        this.router.navigate(['/profile']);
      },
      error: () => {
        this.error = 'Update failed.';
        this.saving = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }
}
