import { Component, input, output } from '@angular/core';
import type { ColorVariant, SizeVariant, ButtonVariant } from '../../types';
import { SpinnerComponent } from '../spinner/spinner.component';

@Component({
  selector: 'button[app-button], a[app-button]',
  standalone: true,
  imports: [SpinnerComponent],
  styleUrl: './button.component.scss',
  template: `
    @if (loading()) {
      <app-spinner size="sm" [color]="spinnerColor()" />
    }
    <ng-content />
  `,
  host: {
    'class': 'btn',
    '[class.btn-full]': 'fullWidth()',
    '[class.btn-sm]': "size() === 'sm'",
    '[class.btn-lg]': "size() === 'lg'",
    '[attr.data-variant]': 'variant()',
    '[attr.data-color]': 'color()',
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

  readonly spinnerColor = () => {
    if (this.variant() === 'solid') return 'neutral' as ColorVariant;
    return this.color();
  };
}
