import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex flex-col items-center justify-center min-h-screen">
      <h1 class="text-6xl font-bold text-gray-300">404</h1>
      <p class="text-xl text-gray-500 mt-4">Page not found</p>
      <a routerLink="/auth/login" class="mt-6 text-blue-500 hover:underline">Go to Login</a>
    </div>
  `,
})
export class NotFoundComponent {}
