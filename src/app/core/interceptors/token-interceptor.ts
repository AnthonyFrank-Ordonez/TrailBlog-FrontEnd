import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.token();
  let newRequest = req;

  const skipUrls = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh'];
  if (skipUrls.some((url) => req.url.includes(url))) {
    return next(req);
  }

  if (token) {
    newRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(newRequest);
};
