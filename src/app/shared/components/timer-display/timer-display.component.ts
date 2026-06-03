import { Component, input, computed } from '@angular/core';

@Component({
  selector: 'app-timer-display',
  standalone: true,
  template: `
    <div class="flex items-center gap-2" role="timer" [attr.aria-label]="'Remaining time: ' + display()">
      <svg class="h-5 w-5" [class]="iconClass()" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-mono font-bold tabular-nums" [class]="textClass()">{{ display() }}</span>
    </div>
  `,
})
export class TimerDisplayComponent {
  readonly remainingSeconds = input(0);

  readonly display = computed(() => {
    const total = Math.max(0, this.remainingSeconds());
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  });

  readonly isUrgent = computed(() => this.remainingSeconds() > 0 && this.remainingSeconds() <= 300);

  readonly textClass = () => this.isUrgent() ? 'text-red-600' : 'text-gray-900';
  readonly iconClass = () => this.isUrgent() ? 'text-red-500 animate-pulse' : 'text-gray-500';
}
