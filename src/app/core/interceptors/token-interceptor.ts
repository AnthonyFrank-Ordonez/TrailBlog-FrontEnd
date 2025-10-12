import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { ApiError } from '@core/models/interface/api-error';
import { RefreshTokenRequest } from '@core/models/interface/auth';
import { AuthService } from '@core/services/auth.service';
import { UserService } from '@core/services/user.service';
import { BehaviorSubject, catchError, filter, Observable, switchMap, take, throwError } from 'rxjs';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);

  const token = authService.token();
  const refreshToken = authService.refreshToken();
  const userId = userService.user()?.id;
  let newRequest = req;

  const refreshData: RefreshTokenRequest = {
    id: userId,
    refreshToken: refreshToken,
  };

  const skipUrls = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  if (skipUrls.some((url) => req.url.includes(url))) {
    return next(req);
  }

  if (token) {
    newRequest = addToken(req, token);
  }

  return next(newRequest).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        debugger;
        return handle401Error(req, next, authService, refreshData);
      } else if (
        error instanceof HttpErrorResponse &&
        error.error &&
        typeof error.error === 'object'
      ) {
        const apiError = error.error as ApiError;
        if (apiError.status === 401) {
          debugger;
          return handle401Error(req, next, authService, refreshData);
        }
      }
      return throwError(() => error);
    }),
  );
};

function addToken<T>(request: HttpRequest<T>, token: string): HttpRequest<T> {
  return request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function handle401Error<T>(
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
  authService: AuthService,
  refreshData: RefreshTokenRequest,
): Observable<HttpEvent<unknown>> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    return authService.refreshUserToken(refreshData).pipe(
      switchMap((response) => {
        isRefreshing = false;
        const newToken = response.accessToken;

        debugger;
        refreshTokenSubject.next(newToken);
        return next(addToken(request, newToken));
      }),
      catchError((err): Observable<HttpEvent<T>> => {
        isRefreshing = false;
        authService.logout();
        return throwError(() => err);
      }),
    );
  } else {
    return refreshTokenSubject.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap((token) => {
        return next(addToken(request, token!));
      }),
    );
  }
}
