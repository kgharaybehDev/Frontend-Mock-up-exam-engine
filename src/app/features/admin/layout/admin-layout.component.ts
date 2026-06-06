import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <aside class="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div class="px-6 py-5 border-b border-gray-100">
          <h1 class="text-lg font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          @for (item of navItems; track item.path) {
            <a
              [routerLink]="item.path"
              routerLinkActive="bg-blue-50 text-blue-700 border-l-4 border-blue-600"
              class="block px-3 py-2 rounded-r text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              [routerLinkActiveOptions]="{ exact: item.exact }"
            >
              {{ item.label }}
            </a>
          }
        </nav>
        <div class="px-4 py-3 border-t border-gray-100">
          <div class="text-xs text-gray-400 mb-2">{{ currentUser?.email }}</div>
          <a routerLink="/candidate/dashboard" class="text-xs text-blue-600 hover:text-blue-800">Back to Dashboard</a>
        </div>
      </aside>
      <main class="flex-1 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  protected readonly currentUser = this.auth.currentUser();

  protected readonly navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', exact: true },
    { path: '/admin/testbanks', label: 'Test Banks', exact: false },
    { path: '/admin/users', label: 'Users', exact: false },
    { path: '/admin/categories', label: 'Categories', exact: false },
    { path: '/admin/config', label: 'Config', exact: false },
    { path: '/admin/logs', label: 'Logs', exact: false },
  ];
}
