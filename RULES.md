# Angular 19+ Strict Coding Rules — ProExam

## 1. Zoneless Change Detection
- Use `provideZonelessChangeDetection()` in app config.
- Never rely on `NgZone`, `zone.js`, or zone-patched async APIs.
- Trigger updates via Signals or `ChangeDetectorRef.markForCheck()` only when required.

## 2. Signals – Primary State Management
- Use `signal()`, `computed()`, `linkedSignal()` for local/component state.
- Use `effect()` only for side effects that need explicit coordination.
- Use `input()`, `output()`, `model()` for component communication.
- Use `viewChild()`, `contentChild()` instead of `@ViewChild`/`@ContentChild` decorators.
- Use `Resource` API (`httpResource` / `rxResource`) for async data fetching — do NOT use raw `HttpClient` + `subscribe`.
- Do NOT use `[(ngModel)]` — use `ngModel` alone only as part of template-driven forms if unavoidable; prefer typed reactive forms.

## 3. New Control Flow Only
- Always use `@if`, `@else if`, `@else` — never `*ngIf`.
- Always use `@for`, `@empty` — never `*ngFor`.
- Always use `@switch`, `@case`, `@default` — never `*ngSwitch`.
- Use `@let` for template variable assignment.
- These are enforced by the Angular 19 template compiler.

## 4. Standalone Components (No NgModule)
- Every component, directive, and pipe must be `standalone: true` (default in Angular 19).
- Do NOT create or import `NgModule` classes.
- Route lazy-loading uses `loadComponent()` directly.
- Use `imports` array on the component metadata for dependencies.

## 5. Dependency Injection via `inject()`
- Use `private readonly x = inject(XxxService)` — never constructor injection.
- Constructor may only accept `@Inject(...)` or trivial forward-refs if unavoidable.
- Use `EnvironmentInjector` / `runInInjectionContext` for out-of-context injection.

## 6. Typed Reactive Forms
- Use `NonNullableFormBuilder` for type-safe, non-nullable forms.
- Leverage the new typed form primitives (`FormControl<number>`, `FormGroup<{...}>`).
- Use `form.controls.xxx` — no raw `.get('xxx')`.
- Use `valueChanged` with observable signals (`toSignal` / `outputFromObservable`) instead of `.valueChanges.subscribe()`.

## 7. The `Resource` API
- Prefer `httpResource` over `HttpClient` directly.
- Prefer `rxResource` for wrapping RxJS-based data sources.
- Use `Resource.status()` (a `signal`) to handle loading / error / success states.

## 8. Routing & Lazy Loading
- Routes use `loadComponent` or `loadChildren` (standalone).
- Use `inject(Router)` / `inject(ActivatedRoute)`.
- Use the new functional guards (`canActivate`, `canMatch` as plain functions).

## 9. Testing
- Use `TestBed` with `provideExperimentalZonelessChangeDetection`.
- Test using signals and `fixture.detectChanges()` in sync mode.
- Use `Harness` pattern for Material-like components where feasible.

## 10. Styling
- Global tokens via CSS custom properties (see `frontend_design_plan.md` for color/corner/spacing tokens).
- View-encapsulated styles via component `styleUrl` (linked files, not inline).
- Use CSS Grid and Flexbox for layout; no heavy third-party CSS frameworks.

## 11. CSS Class Management
- NEVER use `[class]="..."` dynamic binding if it overrides existing classes on the element.
- ALWAYS use static `class="..."` for base classes + `[class.name]="condition"` for dynamic toggles.
- Example: `class="form-input" [class.form-input-error]="!!error()"` — never `[class]="inputClasses()"`.

## 12. Accessibility — Unique Input IDs
- EVERY input component must generate a unique ID using `crypto.randomUUID()` or a static counter.
- The generated ID MUST be used to link `<label for="...">` with `<input id="...">`.
- This ensures screen readers correctly associate labels with inputs at all times.

## 13. LLM Context Awareness
- BEFORE writing code for a new feature, REQUIRED to read `RULES.md` and `llms-full.txt`.
- Explicitly state that RULES.md and llms-full.txt have been reviewed in the response.
- These files define the project conventions, coding rules, and Angular 19 API surface that must be followed.
