import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();

  if (!user) {
    return router.parseUrl('/auth/login');
  }

  if (!allowedRoles.includes(user.role)) {
    return router.parseUrl('/');
  }

  return true;
};
