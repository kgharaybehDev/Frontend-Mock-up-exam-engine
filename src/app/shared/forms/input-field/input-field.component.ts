import { Component, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-input-field',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './input-field.component.html',
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
    const base = 'w-full px-4 py-2.5 bg-white border rounded-lg shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all min-h-[44px]';
    const iconPad = this.leadingIcon() ? 'pl-10' : '';
    const border = this.error()
      ? 'border-red-500 focus:ring-red-500 focus:border-transparent'
      : 'border-gray-300 focus:ring-blue-600 focus:border-transparent';
    const state = this.disabled() ? 'bg-gray-100 cursor-not-allowed' : '';
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
