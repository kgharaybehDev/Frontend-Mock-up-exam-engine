import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (allowedRoles: string[]) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();

  if (!user) {
    if (auth.isAuthenticated()) {
      auth.restoreUserFromToken();
      const restored = auth.currentUser();
      if (restored) {
        const normalized = restored.role.toLowerCase();
        if (allowedRoles.map((r) => r.toLowerCase()).includes(normalized)) {
          return true;
        }
      }
    }
    return router.parseUrl('/auth/login');
  }

  if (!allowedRoles.map((r) => r.toLowerCase()).includes(user.role.toLowerCase())) {
    return router.parseUrl('/');
  }

  return true;
};
