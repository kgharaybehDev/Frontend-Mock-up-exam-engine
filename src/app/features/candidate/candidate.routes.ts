import { Routes } from '@angular/router';

export const candidateRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardComponent),
  },
  {
    path: 'exams',
    loadComponent: () => import('./exam-list/exam-list.component').then((c) => c.ExamListComponent),
  },
  {
    path: 'results',
    loadComponent: () => import('./exam-results/exam-results.component').then((c) => c.ExamResultsComponent),
  },
  {
    path: 'profile',
    loadComponent: () => import('./profile/profile.component').then((c) => c.ProfileComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
