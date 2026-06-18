import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-expert-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-blue-50">
      <nav class="bg-white border-b border-blue-200 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-8">
              <a routerLink="/expert/dashboard" class="flex items-center gap-2 text-blue-800 font-bold text-lg shrink-0">
                <svg class="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                ExamPro
              </a>
              <div class="hidden md:flex items-center gap-1">
                @for (item of navItems; track item.path) {
                  <a
                    [routerLink]="item.path"
                    routerLinkActive="bg-blue-600 text-white shadow-sm"
                    class="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                    [routerLinkActiveOptions]="{ exact: item.exact }"
                  >
                    {{ item.label }}
                  </a>
                }
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div class="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                  {{ userInitials() }}
                </div>
                <span class="text-gray-700 font-medium">{{ currentUser?.firstName }}</span>
              </div>
              <button
                class="md:hidden p-2 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                (click)="mobileOpen.set(!mobileOpen())"
                aria-label="Toggle menu"
              >
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  @if (mobileOpen()) {
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  } @else {
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>
        @if (mobileOpen()) {
          <div class="md:hidden border-t border-blue-100 bg-white px-4 py-3 space-y-1">
            @for (item of navItems; track item.path) {
              <a
                [routerLink]="item.path"
                routerLinkActive="bg-blue-600 text-white"
                class="block px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 transition-colors"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                (click)="mobileOpen.set(false)"
              >
                {{ item.label }}
              </a>
            }
            <div class="pt-3 border-t border-blue-100 mt-3 flex items-center gap-2 text-sm text-gray-600">
              <div class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium">
                {{ userInitials() }}
              </div>
              <span class="text-gray-700 font-medium">{{ currentUser?.firstName }}</span>
              <span class="text-gray-400">({{ currentUser?.email }})</span>
            </div>
          </div>
        }
      </nav>
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <router-outlet />
      </main>
    </div>
  `,
})
export class ExpertLayoutComponent {
  private readonly auth = inject(AuthService);
  protected readonly currentUser = this.auth.currentUser();
  protected readonly mobileOpen = signal(false);

  protected readonly navItems = [
    { path: '/expert/dashboard', label: 'Dashboard', exact: true },
    { path: '/expert/topics', label: 'Topics', exact: false },
    { path: '/expert/questions', label: 'Questions', exact: false },
    { path: '/expert/exams/new', label: 'Exams', exact: false },
    { path: '/expert/results', label: 'Results', exact: false },
    { path: '/expert/grading', label: 'Grading', exact: false },
  ];

  protected userInitials(): string {
    const user = this.currentUser;
    if (!user?.firstName) return '?';
    return user.firstName.charAt(0).toUpperCase();
  }
}
