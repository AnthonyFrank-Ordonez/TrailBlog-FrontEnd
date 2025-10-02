import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { User } from '../models/interface/user';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AuthResponse, Credentials, LoginResponse, RegisterData } from '../models/interface/auth';
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
      tap(() => console.log('logging in...')),
      catchError((error) => {
        return throwError(() => error);
      }),
      tap((response) => {
        this.#tokenSignal.set(response.accessToken);
        this.userService.setUser(response.user);
        this.#refreshTokenSignal.set(response.refreshToken);
      })
    );
  }

  register(userData: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.env.apiRoot}/auth/register`, userData).pipe(
      tap(() => console.log('Signing up user, please wait...')),
      catchError((error) => {
        return throwError(() => error);
      }),
      tap((response) => {
        this.#tokenSignal.set(response.accessToken);
        this.#refreshTokenSignal.set(response.refreshToken);
        this.userService.setUser(response.user);
      })
    );
  }

  logout(): Observable<void | object> {
    return this.http.post(`${this.env.apiRoot}/auth/logout`, null).pipe(
      tap(() => console.log('Signing out user...')),
      catchError((error) => {
        return throwError(() => error);
      }),
      tap(() => {
        this.#tokenSignal.set(null);
        this.#refreshTokenSignal.set(null);
        this.userService.clearUser();
      })
    );
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
