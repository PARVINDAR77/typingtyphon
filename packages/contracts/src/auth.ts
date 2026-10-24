export type UserRole = 'admin' | 'user';

export interface UserProfileDto {
  id: string;
  email: string;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  oauthProvider?: string;
  role: UserRole;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  username: string;
  fullName?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface SocialAuthDto {
  token: string;
  provider: 'google' | 'facebook';
}

export interface AuthResponseDto {
  user: UserProfileDto;
  message?: string;
}
