import { Component, input } from '@angular/core';
import type { ColorVariant } from '../../types';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  template: `
    <div class="w-full bg-gray-200 rounded-full overflow-hidden" role="progressbar" [attr.aria-valuenow]="value()" [attr.aria-valuemin]="0" [attr.aria-valuemax]="100">
      <div
        class="h-full rounded-full transition-all duration-500 ease-out"
        [class]="barClass()"
        [style.width.%]="indeterminate() ? 100 : value()"
        [class.animate-progress-indeterminate]="indeterminate()"
      ></div>
    </div>
  `,
  host: {
    '[style.height]': 'height()',
  },
})
export class ProgressBarComponent {
  readonly value = input(0);
  readonly color = input<ColorVariant>('primary');
  readonly height = input('8px');
  readonly indeterminate = input(false);
  readonly showLabel = input(false);

  readonly barClass = () => {
    const colors: Record<ColorVariant, string> = {
      primary: 'bg-blue-600',
      secondary: 'bg-violet-600',
      success: 'bg-emerald-600',
      warning: 'bg-amber-500',
      danger: 'bg-red-600',
      info: 'bg-cyan-600',
      neutral: 'bg-gray-600',
    };
    return colors[this.color()];
  };
}
