import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const ACCESS_TOKEN_KEY = 'proexam_access_token';

export const roleGuard = (allowedRoles: string[]) => () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  let user = auth.currentUser();

  console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - evaluating, currentUser:`, user?.role, 'allowed:', allowedRoles);

  if (!user) {
    auth.syncFromStorage();
    user = auth.currentUser();
    console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - after syncFromStorage, currentUser:`, user?.role);
  }

  if (!user) {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - no user, localStorage token: ${!!stored}`);
    if (stored) {
      try {
        const payload = JSON.parse(atob(stored.split('.')[1]));
        const rawRole = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'candidate';
        const role = (rawRole === 'Admin' ? 'Admin' : rawRole === 'Expert' ? 'Expert' : 'candidate').toLowerCase();
        console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - decoded role from localStorage JWT: ${role}`);
        if (allowedRoles.map((r) => r.toLowerCase()).includes(role)) {
          console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - ALLOW (from localStorage decode)`);
          return true;
        }
      } catch (err) {
        console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - localStorage JWT decode FAILED:`, err);
      }
    }
    console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - REDIRECT to /auth/login`);
    return router.parseUrl('/auth/login');
  }

  const normalized = user.role.toLowerCase();
  const hasAccess = allowedRoles.map((r) => r.toLowerCase()).includes(normalized);
  console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - role: ${normalized}, hasAccess: ${hasAccess}`);

  if (!hasAccess) {
    console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - REDIRECT to /`);
    return router.parseUrl('/');
  }

  console.log(`[Auth Debug] [${new Date().toISOString()}] RoleGuard - ALLOW`);
  return true;
};
