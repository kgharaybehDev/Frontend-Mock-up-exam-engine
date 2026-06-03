import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex h-screen bg-gray-100">
      <aside class="w-64 bg-white shadow-md hidden lg:block">
        <div class="p-4 border-b">
          <span class="text-xl font-bold text-blue-600">ProExam</span>
        </div>
        <nav class="p-4 space-y-2">
          <p class="text-sm text-gray-500">Navigation coming soon.</p>
        </nav>
      </aside>
      <main class="flex-1 overflow-auto">
        <router-outlet />
      </main>
    </div>
  `,
})
export class DashboardLayoutComponent {}
