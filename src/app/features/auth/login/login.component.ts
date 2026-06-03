import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InputFieldComponent } from '../../../shared/forms/input-field/input-field.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormErrorsComponent } from '../../../shared/forms/form-errors/form-errors.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputFieldComponent,
    ButtonComponent,
    FormErrorsComponent,
  ],
  template: `
    <div class="w-full max-w-sm mx-auto">
      <div class="bg-white rounded-xl shadow-lg px-6 py-8 sm:px-8">
        <div class="text-center mb-8">
          <h1 class="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p class="text-sm text-gray-500 mt-1">Sign in to your ProExam account</p>
        </div>

        @if (serverError()) {
          <div class="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
            {{ serverError() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
          <app-input-field
            formControlName="email"
            label="Email"
            type="email"
            placeholder="you@example.com"
            [required]="true"
            [error]="emailControl.touched ? (emailControl.errors ? ' ' : '') : ''"
          >
            @if (emailControl.touched && emailControl.errors) {
              <app-form-errors [control]="emailControl" />
            }
          </app-input-field>

          <app-input-field
            formControlName="password"
            label="Password"
            type="password"
            placeholder="Enter your password"
            [required]="true"
            [error]="passwordControl.touched ? (passwordControl.errors ? ' ' : '') : ''"
          >
            @if (passwordControl.touched && passwordControl.errors) {
              <app-form-errors [control]="passwordControl" />
            }
          </app-input-field>

          <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Remember me
            </label>
            <a routerLink="/auth/forgot-password" class="text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </a>
          </div>

          <button
            app-button
            type="submit"
            color="primary"
            [fullWidth]="true"
            [loading]="isLoading()"
            [disabled]="form.invalid && form.touched"
          >
            Sign in
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-gray-500">
          Don't have an account?
          <a routerLink="/auth/register" class="text-blue-600 hover:text-blue-700 font-medium ml-1">Create one</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  readonly emailControl = this.form.controls.email;
  readonly passwordControl = this.form.controls.password;

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        this.authService.setTokens(res.data.accessToken, res.data.refreshToken);
        this.authService.currentUser.set(res.data.user);
        this.toast.success('Welcome back!');

        const role = res.data.user.role.toLowerCase();
        if (role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === 'expert') {
          this.router.navigate(['/expert/dashboard']);
        } else {
          this.router.navigate(['/candidate/dashboard']);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(err.error?.error || err.message || 'Invalid email or password. Please try again.');
      },
    });
  }
}
