import { HttpInterceptorFn } from '@angular/common/http';
import { signal } from '@angular/core';
import { tap } from 'rxjs';

export const isLoading = signal(false);
let activeRequests = 0;

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  activeRequests++;
  isLoading.set(true);

  return next(req).pipe(
    tap({
      next: () => {
        activeRequests--;
        if (activeRequests === 0) isLoading.set(false);
      },
      error: () => {
        activeRequests--;
        if (activeRequests === 0) isLoading.set(false);
      },
    }),
  );
};
