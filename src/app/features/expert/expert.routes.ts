import { Routes } from '@angular/router';

export const expertRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then((c) => c.DashboardComponent),
  },
  {
    path: 'questions',
    loadComponent: () => import('./question-bank/question-list/question-list.component').then((c) => c.QuestionListComponent),
  },
  {
    path: 'questions/new',
    loadComponent: () => import('./question-bank/question-editor/question-editor.component').then((c) => c.QuestionEditorComponent),
  },
  {
    path: 'questions/:id/edit',
    loadComponent: () => import('./question-bank/question-editor/question-editor.component').then((c) => c.QuestionEditorComponent),
  },
  {
    path: 'questions/:id/preview',
    loadComponent: () => import('./question-bank/question-preview/question-preview.component').then((c) => c.QuestionPreviewComponent),
  },
  {
    path: 'exams/new',
    loadComponent: () => import('./exam-builder/exam-editor/exam-editor.component').then((c) => c.ExamEditorComponent),
  },
  {
    path: 'exams/:id/edit',
    loadComponent: () => import('./exam-builder/exam-editor/exam-editor.component').then((c) => c.ExamEditorComponent),
  },
  {
    path: 'exams/:id/publish',
    loadComponent: () => import('./exam-builder/exam-publish/exam-publish.component').then((c) => c.ExamPublishComponent),
  },
  {
    path: 'results',
    loadComponent: () => import('./candidate-results/candidate-results.component').then((c) => c.CandidateResultsComponent),
  },
  {
    path: 'grading',
    loadComponent: () => import('./grading/grading.component').then((c) => c.GradingComponent),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
