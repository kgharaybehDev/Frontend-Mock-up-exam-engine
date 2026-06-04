import { Directive, input } from '@angular/core';

@Directive({
  selector: '[appHighlight]',
  standalone: true,
  host: {
    'class': 'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
    '[class.bg-emerald-50]': "appHighlight() === 'success'",
    '[class.text-emerald-800]': "appHighlight() === 'success'",
    '[class.ring-1]': "appHighlight() === 'success'",
    '[class.ring-emerald-200]': "appHighlight() === 'success'",
    '[class.bg-amber-50]': "appHighlight() === 'warning'",
    '[class.text-amber-800]': "appHighlight() === 'warning'",
    '[class.ring-amber-200]': "appHighlight() === 'warning'",
    '[class.bg-red-50]': "appHighlight() === 'danger'",
    '[class.text-red-800]': "appHighlight() === 'danger'",
    '[class.ring-red-200]': "appHighlight() === 'danger'",
    '[class.bg-blue-50]': "appHighlight() === 'info'",
    '[class.text-blue-800]': "appHighlight() === 'info'",
    '[class.ring-blue-200]': "appHighlight() === 'info'",
    '[class.bg-gray-50]': "appHighlight() === 'neutral'",
    '[class.text-gray-800]': "appHighlight() === 'neutral'",
    '[class.ring-gray-200]': "appHighlight() === 'neutral'",
  },
})
export class HighlightDirective {
  readonly appHighlight = input<'success' | 'warning' | 'danger' | 'info' | 'neutral'>('info');
}
