import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';

interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}

function extractDetail(error: HttpErrorResponse): string {
  const body = error.error as ProblemDetails | null;
  if (body?.detail) return body.detail;
  if (body?.title) return body.title;
  if (typeof error.error === 'string') return error.error;
  return error.message || 'An unexpected error occurred.';
}

const STATUS_MESSAGES: Record<number, string> = {
  400: 'Bad request. Please check your input.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found.',
  409: 'A conflict occurred. Please try again.',
  500: 'Server error. Please try again later.',
  503: 'Service unavailable. Please try again later.',
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error instanceof HttpErrorResponse) {
        const detail = extractDetail(error);
        const generic = STATUS_MESSAGES[error.status];
        const message = detail !== error.message ? detail : (generic || detail);
        toast.error(message);
      }
      return throwError(() => error);
    }),
  );
};
