import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
  host: {
    '[class]': 'hostClasses()',
  },
})
export class HighlightDirective {
  readonly appHighlight = input<'success' | 'warning' | 'danger' | 'info' | 'neutral'>('info');

  readonly hostClasses = () => {
    const map: Record<string, string> = {
      success: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
      warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-200',
      danger: 'bg-red-50 text-red-800 ring-1 ring-red-200',
      info: 'bg-blue-50 text-blue-800 ring-1 ring-blue-200',
      neutral: 'bg-gray-50 text-gray-800 ring-1 ring-gray-200',
    };
    return `inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${map[this.appHighlight()] || map.info}`;
  };
}
