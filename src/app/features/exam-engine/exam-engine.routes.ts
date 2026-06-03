import { Routes } from '@angular/router';

export const examEngineRoutes: Routes = [
  {
    path: ':examId',
    loadComponent: () => import('./exam-session/exam-session.component').then((c) => c.ExamSessionComponent),
  },
];
