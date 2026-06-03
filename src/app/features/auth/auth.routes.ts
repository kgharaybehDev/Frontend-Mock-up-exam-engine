import { Routes } from '@angular/router';

export const authRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('../../shared/layouts/auth-layout/auth-layout.component').then((c) => c.AuthLayoutComponent),
    children: [
      {
        path: 'login',
        loadComponent: () => import('./login/login.component').then((c) => c.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () => import('./register/register.component').then((c) => c.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () => import('./forgot-password/forgot-password.component').then((c) => c.ForgotPasswordComponent),
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];
