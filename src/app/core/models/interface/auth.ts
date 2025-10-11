import { User } from './user';

export interface LoginResponse {
  success: string;
  message: string | null;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Credentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  id: string | undefined;
  refreshToken: string | null;
}
