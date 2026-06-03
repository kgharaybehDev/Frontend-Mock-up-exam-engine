import { Component, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';

export interface SelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-select-field',
  standalone: true,
  template: `
    <div class="flex flex-col gap-1.5">
      @if (label()) {
        <label class="text-sm font-medium text-gray-700" [attr.for]="id()">
          {{ label() }}
          @if (required()) { <span class="text-red-500" aria-hidden="true">*</span> }
        </label>
      }
      <select
        [id]="id()"
        [required]="required()"
        [disabled]="disabled()"
        [attr.aria-invalid]="!!error()"
        [attr.aria-describedby]="errorId()"
        [class]="selectClasses()"
        [value]="value()"
        (change)="onSelect($event)"
        (blur)="onTouched()"
      >
        @if (placeholder()) {
          <option value="" disabled>{{ placeholder() }}</option>
        }
        @for (opt of options(); track opt.value) {
          <option [value]="opt.value">{{ opt.label }}</option>
        }
      </select>
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
      useExisting: forwardRef(() => SelectFieldComponent),
      multi: true,
    },
  ],
})
export class SelectFieldComponent implements ControlValueAccessor {
  readonly id = input(`select-${crypto.randomUUID()}`);
  readonly label = input('');
  readonly placeholder = input('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly error = input('');
  readonly hint = input('');
  readonly options = input<SelectOption[]>([]);

  protected readonly value = signal('');
  protected onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  readonly errorId = () => `${this.id()}-error`;

  readonly selectClasses = () => {
    const base = 'w-full rounded-lg border px-3 py-2.5 text-base min-h-[44px] transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%236b7280%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.23%207.21a.75.75%200%20011.06.02L10%2011.168l3.71-3.938a.75.75%200%20111.08%201.04l-4.25%204.5a.75.75%200%2001-1.08%200l-4.25-4.5a.75.75%200%2001.02-1.06z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E")] bg-[length:1.25rem_1.25rem] bg-[right_0.5rem_center] bg-no-repeat pr-10';
    const border = this.error()
      ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';
    const state = this.disabled() ? 'bg-gray-100 cursor-not-allowed' : '';
    return `${base} ${border} ${state}`;
  };

  onSelect(event: Event) {
    const el = event.target as HTMLSelectElement;
    this.value.set(el.value);
    this.onChange(el.value);
  }

  writeValue(val: string) { this.value.set(val ?? ''); }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean) { (this as any).disabled = isDisabled; }
}
