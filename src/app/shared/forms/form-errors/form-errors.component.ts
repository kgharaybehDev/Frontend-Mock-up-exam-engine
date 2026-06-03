import { Component, input, computed } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';

const ERROR_MESSAGES: Record<string, (err?: any) => string> = {
  required: () => 'This field is required.',
  email: () => 'Please enter a valid email address.',
  minlength: (err) => `Minimum ${err?.requiredLength} characters required.`,
  maxlength: (err) => `Maximum ${err?.requiredLength} characters allowed.`,
  min: (err) => `Value must be at least ${err?.min}.`,
  max: (err) => `Value must be at most ${err?.max}.`,
  pattern: () => 'Invalid format.',
  passwordMismatch: () => 'Passwords do not match.',
};

@Component({
  selector: 'app-form-errors',
  standalone: true,
  template: `
    @if (messages().length > 0) {
      <div class="mt-1.5 space-y-0.5" role="alert">
        @for (msg of messages(); track msg) {
          <p class="text-xs text-red-600">{{ msg }}</p>
        }
      </div>
    }
  `,
})
export class FormErrorsComponent {
  readonly control = input<AbstractControl | null>(null);
  readonly customMessages = input<Record<string, string>>({});

  readonly messages = computed(() => {
    const ctrl = this.control();
    const custom = this.customMessages();
    if (!ctrl || !ctrl.errors || (!ctrl.touched && !ctrl.dirty)) return [];

    return Object.entries(ctrl.errors)
      .filter(([key]) => key !== 'asyncValidation')
      .map(([key, err]) => custom[key] || (ERROR_MESSAGES[key] ? ERROR_MESSAGES[key](err) : `Invalid: ${key}`));
  });
}
