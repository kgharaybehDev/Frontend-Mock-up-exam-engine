import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InputFieldComponent } from '../../../shared/forms/input-field/input-field.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormErrorsComponent } from '../../../shared/forms/form-errors/form-errors.component';

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
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly isLoading = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberMe: [false],
  });

  readonly emailControl = this.form.controls.email;
  readonly passwordControl = this.form.controls.password;
  readonly rememberMeControl = this.form.controls.rememberMe;

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

        const { accessToken, refreshToken, user } = res.data;
        if (!accessToken || !refreshToken) {
          this.serverError.set('Authentication failed: Invalid server response. Please try again later.');
          return;
        }

        this.authService.setTokens(accessToken, refreshToken);
        this.authService.currentUser.set(user);

        const role = user.role.toLowerCase();
        const target = role === 'admin'
          ? '/admin/dashboard'
          : role === 'expert'
            ? '/expert/dashboard'
            : '/candidate/dashboard';

        this.router.navigateByUrl(target);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(err.error?.error || err.message || 'Invalid email or password. Please try again.');
      },
    });
  }
}
