import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  readonly appTooltip = input('');

  private tooltipEl: HTMLElement | null = null;

  constructor(private readonly el: ElementRef) {
    this.el.nativeElement.style.position = 'relative';
  }

  @HostListener('mouseenter') show() {
    const text = this.appTooltip();
    if (!text) return;

    this.tooltipEl = document.createElement('div');
    this.tooltipEl.textContent = text;
    Object.assign(this.tooltipEl.style, {
      position: 'absolute',
      bottom: 'calc(100% + 6px)',
      left: '50%',
      transform: 'translateX(-50%)',
      padding: '4px 8px',
      fontSize: '12px',
      color: '#fff',
      background: '#1f2937',
      borderRadius: '4px',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: '50',
    });
    this.el.nativeElement.appendChild(this.tooltipEl);
  }

  @HostListener('mouseleave') hide() {
    this.tooltipEl?.remove();
    this.tooltipEl = null;
  }
}
