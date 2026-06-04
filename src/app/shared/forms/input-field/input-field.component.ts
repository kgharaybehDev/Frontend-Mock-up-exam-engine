import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import type { ControlValueAccessor } from '@angular/forms';

let inputFieldId = 0;

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
  readonly id = input(`input-field-${++inputFieldId}`);
  readonly label = input('');
  readonly type = input('text');
  readonly placeholder = input('');
  readonly autocomplete = input<string>('');
  readonly required = input(false);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly error = input('');
  readonly hint = input('');
  readonly leadingIcon = input(false);

  protected readonly value = signal('');
  private readonly formDisabled = signal(false);
  protected readonly isDisabled = computed(() => this.disabled() || this.formDisabled());
  protected onChange: (v: string) => void = () => {};
  protected onTouched: () => void = () => {};

  readonly errorId = computed(() => `${this.id()}-error`);

  onInput(event: Event) {
    const el = event.target as HTMLInputElement;
    this.value.set(el.value);
    this.onChange(el.value);
  }

  writeValue(val: string) { this.value.set(val ?? ''); }
  registerOnChange(fn: (v: string) => void) { this.onChange = fn; }
  registerOnTouched(fn: () => void) { this.onTouched = fn; }
  setDisabledState(disabled: boolean) { this.formDisabled.set(disabled); }
}
