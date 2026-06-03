import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InputFieldComponent } from '../../../shared/forms/input-field/input-field.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormErrorsComponent } from '../../../shared/forms/form-errors/form-errors.component';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputFieldComponent,
    ButtonComponent,
    FormErrorsComponent,
  ],
  templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly isSuccess = signal(false);
  readonly submittedEmail = signal('');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly emailControl = this.form.controls.email;

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);

    const email = this.form.getRawValue().email;
    this.submittedEmail.set(email);

    this.authService.forgotPassword({ email }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.isSuccess.set(true);
        this.toast.success('Reset link sent!');
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(err.error?.error || err.message || 'Failed to send reset link. Please try again.');
      },
    });
  }
}
