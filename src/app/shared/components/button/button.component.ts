import { Component, input, output } from '@angular/core';
import type { ColorVariant, SizeVariant, ButtonVariant } from '../../types';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'button[app-button], a[app-button]',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    @if (loading()) {
      <app-spinner size="sm" [color]="spinnerColor()" />
    }
    <ng-content />
  `,
  host: {
    '[class]': 'hostClasses()',
    '[attr.disabled]': 'disabled() || loading() ? true : null',
    '[attr.aria-disabled]': 'disabled() || loading()',
    '[attr.aria-busy]': 'loading()',
  },
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('solid');
  readonly color = input<ColorVariant>('primary');
  readonly size = input<SizeVariant>('md');
  readonly disabled = input(false);
  readonly loading = input(false);
  readonly fullWidth = input(false);

  readonly buttonClick = output<MouseEvent>();

  readonly hostClasses = () => {
    const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const sizes: Record<SizeVariant, string> = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2.5 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[52px]',
    };

    const variants: Record<ButtonVariant, Record<ColorVariant, string>> = {
      solid: {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
        secondary: 'bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 active:bg-violet-800',
        success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 active:bg-emerald-800',
        warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 active:bg-amber-700',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
        info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 active:bg-cyan-800',
        neutral: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 active:bg-gray-800',
      },
      outline: {
        primary: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100',
        secondary: 'border-2 border-violet-600 text-violet-600 hover:bg-violet-50 focus:ring-violet-500 active:bg-violet-100',
        success: 'border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500 active:bg-emerald-100',
        warning: 'border-2 border-amber-500 text-amber-600 hover:bg-amber-50 focus:ring-amber-400 active:bg-amber-100',
        danger: 'border-2 border-red-600 text-red-600 hover:bg-red-50 focus:ring-red-500 active:bg-red-100',
        info: 'border-2 border-cyan-600 text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500 active:bg-cyan-100',
        neutral: 'border-2 border-gray-400 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100',
      },
      ghost: {
        primary: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100',
        secondary: 'text-violet-600 hover:bg-violet-50 focus:ring-violet-500 active:bg-violet-100',
        success: 'text-emerald-600 hover:bg-emerald-50 focus:ring-emerald-500 active:bg-emerald-100',
        warning: 'text-amber-600 hover:bg-amber-50 focus:ring-amber-400 active:bg-amber-100',
        danger: 'text-red-600 hover:bg-red-50 focus:ring-red-500 active:bg-red-100',
        info: 'text-cyan-600 hover:bg-cyan-50 focus:ring-cyan-500 active:bg-cyan-100',
        neutral: 'text-gray-600 hover:bg-gray-50 focus:ring-gray-500 active:bg-gray-100',
      },
    };

    const width = this.fullWidth() ? 'w-full' : '';
    return `${base} ${sizes[this.size()]} ${variants[this.variant()][this.color()]} ${width}`;
  };

  readonly spinnerColor = () => {
    if (this.variant() === 'solid') return 'neutral' as ColorVariant;
    return this.color();
  };
}
