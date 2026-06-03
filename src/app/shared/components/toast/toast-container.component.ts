import { Component, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div
      aria-live="polite"
      aria-relevant="additions removals"
      class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          role="alert"
          class="pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all duration-300"
          [class]="bgClass(toast.type)"
        >
          <span class="flex-1 min-w-0">{{ toast.message }}</span>
          <button
            type="button"
            class="shrink-0 p-0.5 rounded hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Dismiss notification"
          >
            <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toastService = inject(ToastService);

  bgClass(type: string) {
    const map: Record<string, string> = {
      primary: 'bg-blue-600',
      secondary: 'bg-violet-600',
      success: 'bg-emerald-600',
      warning: 'bg-amber-500',
      danger: 'bg-red-600',
      info: 'bg-cyan-600',
      neutral: 'bg-gray-700',
    };
    return map[type] || 'bg-gray-700';
  }
}
