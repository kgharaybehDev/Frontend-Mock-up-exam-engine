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
  templateUrl: './login.component.html',
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
