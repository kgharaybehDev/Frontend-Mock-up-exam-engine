import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
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
        path: 'testbanks',
        loadComponent: () => import('./testbanks/testbanks.component').then((c) => c.TestbanksComponent),
      },
      {
        path: 'testbanks/:testBankId/topics',
        loadComponent: () => import('./topics/topics.component').then((c) => c.TopicsComponent),
      },
      {
        path: 'testbanks/:testBankId/topics/:topicId/questions',
        loadComponent: () => import('./question-editor/question-list.component').then((c) => c.QuestionListComponent),
      },
      {
        path: 'testbanks/:testBankId/topics/:topicId/questions/new',
        loadComponent: () => import('./question-editor/question-editor.component').then((c) => c.QuestionEditorComponent),
      },
      {
        path: 'testbanks/:testBankId/topics/:topicId/questions/:questionId/edit',
        loadComponent: () => import('./question-editor/question-editor.component').then((c) => c.QuestionEditorComponent),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
