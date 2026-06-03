import { Injectable, signal } from '@angular/core';
import type { ColorVariant } from '../../types';

export interface Toast {
  id: number;
  message: string;
  type: ColorVariant;
  duration: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);
  private nextId = 0;

  show(message: string, type: ColorVariant = 'info', duration = 4000) {
    const id = this.nextId++;
    this.toasts.update((t) => [...t, { id, message, type, duration }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(message: string) { return this.show(message, 'success'); }
  error(message: string) { return this.show(message, 'danger', 6000); }
  warning(message: string) { return this.show(message, 'warning'); }
  info(message: string) { return this.show(message, 'info'); }

  dismiss(id: number) {
    this.toasts.update((t) => t.filter((toast) => toast.id !== id));
  }
}
