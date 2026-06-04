import { Component, input } from '@angular/core';
import type { ColorVariant, SizeVariant } from '../../types';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <svg
      class="animate-spin"
      [class.h-4]="size() === 'sm'"
      [class.w-4]="size() === 'sm'"
      [class.h-6]="size() === 'md'"
      [class.w-6]="size() === 'md'"
      [class.h-10]="size() === 'lg'"
      [class.w-10]="size() === 'lg'"
      [attr.aria-label]="ariaLabel()"
      role="status"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
    <span class="sr-only">{{ ariaLabel() }}</span>
  `,
  host: {
    '[class.text-blue-600]': "color() === 'primary'",
    '[class.text-violet-600]': "color() === 'secondary'",
    '[class.text-emerald-600]': "color() === 'success'",
    '[class.text-amber-600]': "color() === 'warning'",
    '[class.text-red-600]': "color() === 'danger'",
    '[class.text-cyan-600]': "color() === 'info'",
    '[class.text-gray-600]': "color() === 'neutral'",
  },
})
export class SpinnerComponent {
  readonly size = input<SizeVariant>('md');
  readonly color = input<ColorVariant>('primary');
  readonly ariaLabel = input('Loading');
}
