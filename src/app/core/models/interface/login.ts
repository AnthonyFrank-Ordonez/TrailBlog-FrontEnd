import { User } from './user';

export interface Credentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: string;
  message: string | null;
  accessToken: string;
  refreshToken: string;
  user: User;
}
