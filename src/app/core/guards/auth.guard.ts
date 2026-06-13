import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const ACCESS_TOKEN_KEY = 'proexam_access_token';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const isAuth = auth.isAuthenticated();
  const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
  const syncResult = auth.syncFromStorage();

  if (isAuth || syncResult || !!stored) {
    return true;
  }

  return router.parseUrl('/auth/login');
};
