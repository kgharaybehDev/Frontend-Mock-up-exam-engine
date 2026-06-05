import { Routes } from '@angular/router';

export const examEngineRoutes: Routes = [
  {
    path: 'session/:attemptId',
    loadComponent: () => import('./exam-session/exam-session.component').then((c) => c.ExamSessionComponent),
  },
  {
    path: 'result/:attemptId',
    loadComponent: () => import('./exam-result/exam-result.component').then((c) => c.ExamResultComponent),
  },
  {
    path: 'report/:id',
    loadComponent: () => import('./exam-report/exam-report.component').then((c) => c.ExamReportComponent),
  },
  {
    path: '**',
    redirectTo: '/candidate/dashboard',
  },
];
