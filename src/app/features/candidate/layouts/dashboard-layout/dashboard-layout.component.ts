import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-layout.component.html',
})
export class DashboardLayoutComponent {
  private readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  readonly user = this.authService.currentUser;
  readonly sidebarOpen = signal(false);

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });

  readonly displayName = computed(() => {
    const u = this.user();
    return u?.firstName || u?.email || 'User';
  });

  readonly navLinks = [
    { path: '/candidate/dashboard', label: 'Dashboard', icon: 'grid' },
    { path: '/candidate/exams', label: 'Available Exams', icon: 'book' },
    { path: '/candidate/results', label: 'My Results', icon: 'chart' },
    { path: '/candidate/profile', label: 'Profile', icon: 'user' },
  ];

  toggleSidebar() {
    this.sidebarOpen.update((v) => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
