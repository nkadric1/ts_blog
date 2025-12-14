export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  bio: string;
  profileImageUrl: string;
}

export interface UpdateUserProfile {
  fullName: string;
  bio: string;
  profileImageUrl: string;
}
