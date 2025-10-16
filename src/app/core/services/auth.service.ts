import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '@env/environment';
import {
  AuthResponse,
  Credentials,
  LoginResponse,
  RefreshTokenRequest,
  RegisterData,
} from '../models/interface/auth';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  env = environment;

  #tokenSignal = signal<string | null>(null);
  #refreshTokenSignal = signal<string | null>(null);

  token = this.#tokenSignal.asReadonly();
  refreshToken = this.#refreshTokenSignal.asReadonly();

  isAuthenticated = computed(() => !!this.#tokenSignal());

  constructor() {
    untracked(() => {
      this.initializeTokens();
    });

    effect(() => {
      const token = this.#tokenSignal();
      const refreshToken = this.#refreshTokenSignal();
      const user = this.userService.user();

      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }

      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      } else {
        localStorage.removeItem('refreshToken');
      }

      if (user) {
        localStorage.setItem('userInfo', JSON.stringify(user));
      } else {
        localStorage.removeItem('userInfo');
      }
    });
  }

  login(credentials: Credentials): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.env.apiRoot}/auth/login`, credentials).pipe(
      tap((response) => {
        console.log('logging in...');

        this.#tokenSignal.set(response.accessToken);
        this.userService.setUser(response.user);
        this.#refreshTokenSignal.set(response.refreshToken);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.env.apiRoot}/auth/register`, userData).pipe(
      tap((response) => {
        console.log('Signing up user, please wait...');

        this.#tokenSignal.set(response.accessToken);
        this.#refreshTokenSignal.set(response.refreshToken);
        this.userService.setUser(response.user);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  logout(): Observable<void | object> {
    return this.http.post(`${this.env.apiRoot}/auth/logout`, null).pipe(
      tap(() => {
        console.log('Signing out user...');

        this.#tokenSignal.set(null);
        this.#refreshTokenSignal.set(null);
        this.userService.clearUser();
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  refreshUserToken(refreshData: RefreshTokenRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.env.apiRoot}/auth/refresh-token`, refreshData).pipe(
      tap((response) => {
        console.log('Refreshing token...');

        this.setAuth(response);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  setAuth(authResponse: AuthResponse) {
    this.#tokenSignal.set(authResponse.accessToken);
    this.#refreshTokenSignal.set(authResponse.refreshToken);
    this.userService.setUser(authResponse.user);
  }

  private initializeTokens(): void {
    const storedToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storeUser = localStorage.getItem('userInfo');

    if (storedToken) {
      this.#tokenSignal.set(storedToken);
    }

    if (storedRefreshToken) {
      this.#refreshTokenSignal.set(storedRefreshToken);
    }

    if (storeUser) {
      this.userService.setUser(JSON.parse(storeUser));
    }
  }
}
