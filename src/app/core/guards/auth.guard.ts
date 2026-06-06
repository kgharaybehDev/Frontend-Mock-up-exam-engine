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

  console.log(`[Auth Debug] [${new Date().toISOString()}] AuthGuard - isAuthenticated: ${isAuth}, syncFromStorage: ${syncResult}, localStorage has token: ${!!stored}`);

  if (isAuth || syncResult || !!stored) {
    console.log(`[Auth Debug] [${new Date().toISOString()}] AuthGuard - ALLOW`);
    return true;
  }

  console.log(`[Auth Debug] [${new Date().toISOString()}] AuthGuard - REDIRECT to /auth/login`);
  return router.parseUrl('/auth/login');
};
