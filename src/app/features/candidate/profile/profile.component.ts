import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ProfileService } from '../../../core/services/profile.service';
import { InputFieldComponent } from '../../../shared/forms/input-field/input-field.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { FormErrorsComponent } from '../../../shared/forms/form-errors/form-errors.component';
import { ToastService } from '../../../shared/components/toast/toast.service';
import type { CandidateDto } from '../../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, InputFieldComponent, ButtonComponent, FormErrorsComponent, DatePipe],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly profileService = inject(ProfileService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly serverError = signal<string | null>(null);
  readonly profile = signal<CandidateDto | null>(null);

  readonly form = this.fb.group({
    specialization: [''],
    certificationTarget: [''],
    country: ['', [Validators.required]],
  });

  readonly specializationControl = this.form.controls.specialization;
  readonly certificationTargetControl = this.form.controls.certificationTarget;
  readonly countryControl = this.form.controls.country;

  ngOnInit() {
    this.profileService.getProfile().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profile.set(res.data);
          this.form.patchValue({
            specialization: res.data.specialization ?? '',
            certificationTarget: res.data.certificationTarget ?? '',
            country: res.data.country,
          });
        }
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(err.error?.error || err.message || 'Failed to load profile.');
      },
    });
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.serverError.set(null);

    this.profileService.updateProfile(this.form.getRawValue()).subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res.success && res.data) {
          this.profile.set(res.data);
          this.form.patchValue({
            specialization: res.data.specialization ?? '',
            certificationTarget: res.data.certificationTarget ?? '',
            country: res.data.country,
          });
          this.toast.success('Profile updated successfully.');
        }
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        this.serverError.set(err.error?.error || err.message || 'Failed to update profile.');
      },
    });
  }
}
