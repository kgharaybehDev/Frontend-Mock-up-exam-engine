import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <router-outlet />
    </div>
  `,
})
export class AuthLayoutComponent {}
