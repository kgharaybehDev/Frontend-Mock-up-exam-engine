import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const ACCESS_TOKEN_KEY = 'proexam_access_token';

export const roleGuard = (allowedRoles: string[]) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  let user = auth.currentUser();

  if (!user) {
    auth.syncFromStorage();
    user = auth.currentUser();
  }

  if (!user) {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored) {
      try {
        const payload = JSON.parse(atob(stored.split('.')[1]));
        const rawRole = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'candidate';
        const role = (rawRole === 'Admin' ? 'Admin' : rawRole === 'Expert' ? 'Expert' : 'candidate').toLowerCase();
        if (allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
          return true;
        }
      } catch {
        return router.parseUrl('/auth/login');
      }
    }
    return router.parseUrl('/auth/login');
  }

  const normalized = user.role.toLowerCase();
  const hasAccess = allowedRoles.map((r) => r.toLowerCase()).includes(normalized);

  if (!hasAccess) {
    return router.parseUrl('/');
  }

  return true;
};
