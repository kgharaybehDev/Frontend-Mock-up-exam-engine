import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    @if (title() || header()) {
      <div class="px-5 py-4 border-b border-gray-100">
        <ng-content select="[card-header]" />
        @if (title() && !header()) {
          <h3 class="text-lg font-semibold text-gray-900">{{ title() }}</h3>
        }
      </div>
    }
    <div class="px-5 py-4">
      <ng-content />
    </div>
    @if (footer()) {
      <div class="px-5 py-3 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <ng-content select="[card-footer]" />
      </div>
    }
  `,
  host: {
    class: 'block bg-white rounded-xl shadow-sm border border-gray-200',
  },
})
export class CardComponent {
  readonly title = input<string>();
  readonly header = input(false, { alias: 'hasHeader' });
  readonly footer = input(false, { alias: 'hasFooter' });
}
