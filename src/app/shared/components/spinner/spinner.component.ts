import { Component, input } from '@angular/core';
import type { ColorVariant, SizeVariant } from '../../types';

@Component({
  selector: 'app-spinner',
  standalone: true,
  template: `
    <svg
      class="animate-spin"
      [class]="sizeClass()"
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
    '[class]': 'colorClass()',
  },
})
export class SpinnerComponent {
  readonly size = input<SizeVariant>('md');
  readonly color = input<ColorVariant>('primary');
  readonly ariaLabel = input('Loading');

  readonly sizeClass = () => {
    const sizes: Record<SizeVariant, string> = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
    return sizes[this.size()];
  };

  readonly colorClass = () => {
    const colors: Record<ColorVariant, string> = {
      primary: 'text-blue-600',
      secondary: 'text-violet-600',
      success: 'text-emerald-600',
      warning: 'text-amber-600',
      danger: 'text-red-600',
      info: 'text-cyan-600',
      neutral: 'text-gray-600',
    };
    return colors[this.color()];
  };
}
