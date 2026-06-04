import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  template: `
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-gray-500">{{ label() }}</span>
        <div class="h-10 w-10 rounded-lg flex items-center justify-center" [class]="iconBg()">
          <ng-content />
        </div>
      </div>
      <p class="text-3xl font-bold text-gray-900 mt-3">{{ displayValue() }}</p>
    </div>
  `,
  host: { class: 'block' },
})
export class DashboardCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<number | null>();
  readonly suffix = input<string>('');
  readonly iconBg = input<string>('bg-blue-50 text-blue-600');

  readonly displayValue = computed(() => {
    const v = this.value();
    if (v === null) return '—';
    return `${v}${this.suffix()}`;
  });
}
