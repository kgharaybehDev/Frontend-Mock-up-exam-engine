import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((r) => r.authRoutes),
  },
  {
    path: 'candidate',
    canActivate: [authGuard],
    loadChildren: () => import('./features/candidate/candidate.routes').then((r) => r.candidateRoutes),
  },
  {
    path: 'expert',
    canActivate: [authGuard, roleGuard(['Expert', 'Admin'])],
    loadChildren: () => import('./features/expert/expert.routes').then((r) => r.expertRoutes),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['Admin'])],
    loadChildren: () => import('./features/admin/admin.routes').then((r) => r.adminRoutes),
  },
  {
    path: 'exam',
    canActivate: [authGuard],
    loadChildren: () => import('./features/exam-engine/exam-engine.routes').then((r) => r.examEngineRoutes),
  },
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full',
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found.component').then((c) => c.NotFoundComponent),
  },
];
