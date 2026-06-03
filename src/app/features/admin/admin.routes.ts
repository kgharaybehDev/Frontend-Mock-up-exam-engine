import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardComponent),
  },
  {
    path: 'users',
    loadComponent: () => import('./user-management/user-management.component').then((c) => c.UserManagementComponent),
  },
  {
    path: 'categories',
    loadComponent: () => import('./category-manager/category-manager.component').then((c) => c.CategoryManagerComponent),
  },
  {
    path: 'config',
    loadComponent: () => import('./system-config/system-config.component').then((c) => c.SystemConfigComponent),
  },
  {
    path: 'logs',
    loadComponent: () => import('./logs-viewer/logs-viewer.component').then((c) => c.LogsViewerComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
