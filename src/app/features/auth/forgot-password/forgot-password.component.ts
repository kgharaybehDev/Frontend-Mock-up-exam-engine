import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="flex items-center justify-center min-h-screen bg-gray-50">
      <div class="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h1 class="text-2xl font-semibold text-center mb-6">Forgot Password</h1>
        <p class="text-center text-gray-500">Password reset form coming soon.</p>
        <p class="text-center mt-4">
          <a routerLink="/auth/login" class="text-blue-500 hover:underline">Back to Login</a>
        </p>
      </div>
    </div>
  `,
})
export class ForgotPasswordComponent {}
