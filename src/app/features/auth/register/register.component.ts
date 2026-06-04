import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { InputFieldComponent } from '../../../shared/forms/input-field/input-field.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormErrorsComponent } from '../../../shared/forms/form-errors/form-errors.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import type { RegisterRequestDto } from '../../../core/models/auth.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputFieldComponent,
    ButtonComponent,
    FormErrorsComponent,
  ],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly isLoading = signal(false);
  readonly serverError = signal<string | null>(null);

  readonly form = this.fb.group({
    fullName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

  readonly nameControl = this.form.controls.fullName;
  readonly emailControl = this.form.controls.email;
  readonly passwordControl = this.form.controls.password;
  readonly confirmPasswordControl = this.form.controls.confirmPassword;

  private passwordMatchValidator(group: AbstractControl) {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (password && confirm && password !== confirm) {
      group.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.serverError.set(null);

    const raw = this.form.getRawValue();
    const nameParts = raw.fullName.trim().split(' ');

    const payload: RegisterRequestDto = {
      email: raw.email,
      password: raw.password,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      roleId: 3,
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toast.success('Account created! Please sign in.');
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.serverError.set(err.error?.error || err.message || 'Registration failed. Please try again.');
      },
    });
  }
}
