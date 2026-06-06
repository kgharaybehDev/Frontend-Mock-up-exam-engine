import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  const isAuthEndpoint = req.url.includes('/auth/login')
    || req.url.includes('/auth/register')
    || req.url.includes('/auth/refresh');

  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    console.log(`[Auth Debug] [${new Date().toISOString()}] Interceptor - attaching Bearer token to:`, req.url.substring(0, 60));
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  } else {
    console.log(`[Auth Debug] [${new Date().toISOString()}] Interceptor - NO token for:`, req.url.substring(0, 60));
  }

  return next(req).pipe(
    catchError((error) => {
      if (
        error instanceof HttpErrorResponse
        && error.status === 401
        && !isRefreshing
        && !isAuthEndpoint
      ) {
        console.log(`[Auth Debug] [${new Date().toISOString()}] Interceptor - 401 received, attempting refresh`);
        isRefreshing = true;
        return auth.refresh().pipe(
          switchMap((res) => {
            isRefreshing = false;
            console.log(`[Auth Debug] [${new Date().toISOString()}] Interceptor - refresh SUCCESS`);
            auth.setTokens(res.data.accessToken, res.data.refreshToken);
            const cloned = req.clone({
              setHeaders: { Authorization: `Bearer ${res.data.accessToken}` },
            });
            return next(cloned);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            console.log(`[Auth Debug] [${new Date().toISOString()}] Interceptor - refresh FAILED, logging out`);
            auth.logout();
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
