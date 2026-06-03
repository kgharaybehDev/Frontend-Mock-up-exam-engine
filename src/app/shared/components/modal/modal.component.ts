import { Component, effect, input, output, signal, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  standalone: true,
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
        <div class="fixed inset-0 bg-black/50 transition-opacity" (click)="close()" (keydown)="onKeydown($event)" />
        <div
          #dialogPanel
          class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto focus:outline-none"
          [class]="sizeClass()"
          role="document"
          tabindex="-1"
        >
          @if (title() || showClose()) {
            <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">{{ title() }}</h2>
              @if (showClose()) {
                <button
                  type="button"
                  class="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  (click)="close()"
                  aria-label="Close dialog"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              }
            </div>
          }
          <div class="px-6 py-4">
            <ng-content />
          </div>
          @if (footer()) {
            <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <ng-content select="[modal-footer]" />
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  readonly open = input(false);
  readonly title = input('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly showClose = input(true);
  readonly footer = input(false, { alias: 'hasFooter' });

  readonly dismiss = output<void>();

  protected readonly isOpen = signal(false);

  private previousActiveElement: HTMLElement | null = null;

  constructor() {
    effect(() => {
      const isOpen = this.open();
      this.isOpen.set(isOpen);
      if (isOpen) {
        this.previousActiveElement = document.activeElement as HTMLElement;
        setTimeout(() => {
          const panel = document.querySelector('[role="document"]') as HTMLElement;
          panel?.focus();
        });
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
        this.previousActiveElement?.focus();
        this.previousActiveElement = null;
      }
    });
  }

  readonly sizeClass = () => {
    const sizes: Record<string, string> = {
      sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl',
    };
    return sizes[this.size()];
  };

  close() {
    this.isOpen.set(false);
    this.dismiss.emit();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.close();
  }
}
