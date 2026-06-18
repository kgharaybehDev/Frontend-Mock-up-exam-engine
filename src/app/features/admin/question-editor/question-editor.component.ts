import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { FormBuilder, FormArray, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { QuillEditorComponent } from 'ngx-quill';
import { QuestionService } from '../../../core/services/question.service';
import type { CreateQuestionDto, QuestionDto } from '../../../core/models/exam.model';
import type { ApiResponse } from '../../../core/models/api-response.model';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

@Component({
  selector: 'app-question-editor',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, QuillEditorComponent],
  template: `
    <div class="p-6 max-w-4xl mx-auto space-y-6">
      <div class="flex items-center gap-3">
        <a [routerLink]="['/admin/testbanks', testBankId(), 'topics', topicId(), 'questions']" class="text-sm text-blue-600 hover:text-blue-800">&larr; Back</a>
        <h1 class="text-2xl font-bold text-gray-900">{{ isEdit() ? 'Edit Question' : 'New Question' }}</h1>
      </div>

      @if (loading()) {
        <div class="text-center py-12 text-gray-400">Loading...</div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="space-y-6">

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h2 class="text-sm font-semibold text-gray-900">Question Body</h2>
            <quill-editor
              formControlName="body"
              [modules]="editorModules"
              placeholder="Enter the question text..."
              class="block"
              [class.border-red-400]="showErrors() && form.get('body')?.invalid"
            />
            @if (showErrors() && form.get('body')?.invalid) {
              <p class="text-xs text-red-500">Question body is required.</p>
            }
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-semibold text-gray-900">Options</h2>
              <button type="button" class="text-xs text-blue-600 hover:text-blue-800 font-medium" (click)="addOption()" [disabled]="options.length >= 6">+ Add Option</button>
            </div>

            <div formArrayName="options" class="space-y-3">
              @for (opt of options.controls; track $index; let i = $index) {
                <div [formGroupName]="i" class="flex items-start gap-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                  <div class="flex items-center gap-2 pt-1">
                    <input
                      type="radio"
                      name="correctOption"
                      [value]="i"
                      [checked]="correctIndex() === i"
                      (change)="setCorrect(i)"
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500"
                    />
                    <span class="text-xs font-mono font-semibold text-gray-500 w-4">{{ opt.get('optionLetter')?.value }}</span>
                  </div>
                  <div class="flex-1 space-y-1">
                    <quill-editor
                      [formControlName]="'optionText'"
                      [modules]="miniEditorModules"
                      placeholder="Option text..."
                      class="block text-sm"
                      [class.border-red-400]="showErrors() && opt.get('optionText')?.invalid"
                    />
                  </div>
                  <button type="button" class="text-gray-400 hover:text-red-500 shrink-0 pt-1" (click)="removeOption(i)" [disabled]="options.length <= 2">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              }
            </div>

            @if (showErrors() && correctIndex() === null) {
              <p class="text-xs text-red-500">Select at least one correct option.</p>
            }
            @if (showErrors() && form.get('options')?.errors?.['duplicateLetters']) {
              <p class="text-xs text-red-500">Options must have unique letter assignments.</p>
            }
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 space-y-4">
            <h2 class="text-sm font-semibold text-gray-900">Explanation</h2>
            <quill-editor
              formControlName="explanation"
              [modules]="editorModules"
              placeholder="Explain the correct answer..."
              class="block"
            />
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center gap-4">
            <label class="text-sm font-medium text-gray-700">Difficulty Level</label>
            <select formControlName="difficultyLevel" class="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option [value]="1">Easy</option>
              <option [value]="2">Medium</option>
              <option [value]="3">Hard</option>
            </select>
          </div>

          @if (saveError()) {
            <div class="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{{ saveError() }}</div>
          }

          <div class="flex gap-3 justify-end">
            <a [routerLink]="['/admin/testbanks', testBankId(), 'topics', topicId(), 'questions']" class="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</a>
            <button type="submit" class="px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" [disabled]="saving()">
              {{ saving() ? 'Saving...' : (isEdit() ? 'Update Question' : 'Create Question') }}
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class QuestionEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly questionService = inject(QuestionService);

  protected readonly testBankId = signal('');
  protected readonly topicId = signal('');
  protected readonly questionId = signal('');
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');
  protected readonly showErrors = signal(false);
  protected readonly correctIndex = signal<number | null>(null);

  protected readonly isEdit = signal(false);

  protected readonly editorModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
  };

  protected readonly miniEditorModules = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      ['clean'],
    ],
  };

  protected form = this.fb.group({
    body: ['', Validators.required],
    explanation: [''],
    difficultyLevel: [1, Validators.required],
    options: this.fb.array([]),
  });

  protected get options(): FormArray {
    return this.form.get('options') as FormArray;
  }

  ngOnInit() {
    const params = this.route.snapshot.paramMap;
    const topicId = params.get('topicId');
    const testBankId = params.get('testBankId');
    const questionId = params.get('questionId');

    if (topicId && testBankId) {
      this.topicId.set(topicId);
      this.testBankId.set(testBankId);

      if (questionId && questionId !== 'new') {
        this.isEdit.set(true);
        this.questionId.set(questionId);
        this.loadQuestion(questionId);
      } else {
        this.addOption();
        this.addOption();
      }
    }
  }

  private loadQuestion(id: string) {
    this.loading.set(true);
    this.questionService.getById(id).subscribe({
      next: (res: any) => {
        if (res.success && res.data) {
          const d = res.data as any;
          this.form.patchValue({
            body: d.body,
            explanation: d.answer?.explanation ?? '',
            difficultyLevel: d.difficultyLevel,
          });
          this.options.clear();
          (d.options as any[] ?? []).forEach((opt: any, i: number) => {
            this.options.push(this.fb.group({
              optionLetter: [opt.optionLetter, Validators.required],
              optionText: [opt.optionText, Validators.required],
              isCorrect: [opt.isCorrect],
              displayOrder: [opt.displayOrder],
            }));
            if (opt.isCorrect) {
              this.correctIndex.set(i);
            }
          });
        }
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected addOption() {
    const len = this.options.length;
    if (len >= 6) return;
    this.options.push(this.fb.group({
      optionLetter: [LETTERS[len]],
      optionText: ['', Validators.required],
      isCorrect: [false],
      displayOrder: [len + 1],
    }));
  }

  protected removeOption(index: number) {
    if (this.options.length <= 2) return;
    const ci = this.correctIndex();
    this.options.removeAt(index);
    if (ci === index) {
      this.correctIndex.set(null);
    } else if (ci !== null && ci > index) {
      this.correctIndex.set(ci - 1);
    }
    this.options.controls.forEach((ctrl, i) => ctrl.get('optionLetter')?.setValue(LETTERS[i]));
  }

  protected setCorrect(index: number) {
    this.correctIndex.set(index);
  }

  protected save() {
    this.showErrors.set(true);
    this.saveError.set('');

    const body = this.form.get('body')?.value?.trim();
    if (!body) return;

    const ci = this.correctIndex();
    if (ci === null || ci === undefined) {
      this.saveError.set('Please select one correct option.');
      return;
    }

    if (this.options.length < 2) {
      this.saveError.set('Please add at least 2 options.');
      return;
    }

    const letters = new Set<string>();
    for (const ctrl of this.options.controls) {
      const letter = ctrl.get('optionLetter')?.value;
      if (letters.has(letter)) {
        this.saveError.set('Duplicate option letters detected.');
        return;
      }
      letters.add(letter);
    }

    this.saving.set(true);
    const correctAnswer = this.options.controls[ci]?.get('optionLetter')?.value ?? LETTERS[ci];
    const dto: CreateQuestionDto = {
      topicId: this.topicId(),
      body,
      difficultyLevel: this.form.get('difficultyLevel')?.value ?? 1,
      explanation: this.form.get('explanation')?.value?.trim() ?? '',
      correctAnswer,
      attachments: [],
      options: this.options.controls.map((ctrl, i) => ({
        optionLetter: ctrl.get('optionLetter')?.value ?? LETTERS[i],
        optionText: ctrl.get('optionText')?.value?.trim() ?? '',
        isCorrect: i === ci,
        displayOrder: i + 1,
      })),
    };

    const obs = this.isEdit()
      ? this.questionService.update(this.questionId(), dto)
      : this.questionService.create(this.topicId(), dto);

    obs.subscribe({
      next: (res: any) => {
        if (res.success) {
          this.router.navigate(['/admin/testbanks', this.testBankId(), 'topics', this.topicId(), 'questions']);
        } else {
          this.saveError.set(res.error || 'Failed to save question.');
        }
        this.saving.set(false);
      },
      error: () => {
        this.saveError.set('Failed to save question. Please try again.');
        this.saving.set(false);
      },
    });
  }
}
