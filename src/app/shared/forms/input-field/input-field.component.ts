import { Component, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label class="text-sm font-medium text-gray-700" [attr.for]="id()">
          {{ label() }}
          @if (required()) { <span class="text-red-500" aria-hidden="true">*</span> }
        </label>
      }
      <div class="relative">
        @if (leadingIcon()) {
          <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <ng-content select="[leading-icon]" />
          </span>
        }
        <input
          [id]="id()"
          [type]="type()"
          [placeholder]="placeholder()"
          [required]="required()"
          [disabled]="disabled()"
          [readonly]="readonly()"
          [attr.aria-invalid]="!!error()"
          [attr.aria-describedby]="errorId()"
          [class]="inputClasses()"
          [value]="value()"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
      </div>
      @if (hint() && !error()) {
        <p class="text-xs text-gray-500">{{ hint() }}</p>
      }
      @if (error()) {
        <p class="text-xs text-red-600" [id]="errorId()" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputFieldComponent),
      multi: true,
    },
  ],
})
export class InputFieldComponent implements ControlValueAccessor {
  readonly id = input(`input-${crypto.randomUUID()}`);
  readonly label = input('');
  readonly type = input('text');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly error = input('');
  readonly hint = input('');
  readonly leadingIcon = input(false);

  protected readonly value = signal('');
  protected onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  readonly errorId = () => `${this.id()}-error`;

  readonly inputClasses = () => {
    const base = 'w-full rounded-lg border px-3 py-2.5 text-base min-h-[44px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0';
    const iconPad = this.leadingIcon() ? 'pl-10' : '';
    const border = this.error()
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    const state = this.disabled() ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
    return `${base} ${iconPad} ${border} ${state}`;
  };

  onInput(event: Event) {
    const el = event.target as HTMLInputElement;
    this.value.set(el.value);
    this.onChange(el.value);
  }

  writeValue(val: string) { this.value.set(val ?? ''); }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean) { (this as any).disabled = isDisabled; }
}
