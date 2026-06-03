import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error) => {
      const message = error.error?.error || error.message || 'An unexpected error occurred';
      console.error(`[API Error] ${req.method} ${req.url}:`, message);
      return throwError(() => error);
    }),
  );
};
