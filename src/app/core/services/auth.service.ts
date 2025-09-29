import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { User } from '../models/interface/user';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { Credentials, LoginResponse } from '../models/interface/login';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  env = environment;

  #userSignal = signal<User | null>(null);
  #tokenSignal = signal<string | null>(null);
  #refreshTokenSignal = signal<string | null>(null);

  currentUser = this.#userSignal.asReadonly();
  token = this.#tokenSignal.asReadonly();
  refreshToken = this.#refreshTokenSignal.asReadonly();

  isAuthenticated = computed(() => !!this.#tokenSignal());
  isAdmin = computed(() => this.#userSignal()?.roles.includes('Admin'));

  constructor() {
    effect(() => {
      const token = this.#tokenSignal();
      const refreshToken = this.#refreshTokenSignal();

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
        this.#userSignal.set(response.user);
        this.#refreshTokenSignal.set(response.refreshToken);
      })
    );
  }

  async signOut(): Promise<void> {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    this.#tokenSignal.set(null);
    this.#userSignal.set(null);
    this.#refreshTokenSignal.set(null);

    await this.router.navigateByUrl('/login');
  }
}
