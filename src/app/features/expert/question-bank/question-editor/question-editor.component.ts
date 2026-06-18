import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { QuestionService } from '../../../../core/services/question.service';
import { TestBankService } from '../../../../core/services/test-bank.service';
import { TopicService } from '../../../../core/services/topic.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import type { QuestionDto, CreateQuestionDto, TopicDto } from '../../../../core/models/exam.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-question-editor',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    @if (pageLoading()) {
      <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
    } @else {
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-5 border-b border-gray-100">
            <h1 class="text-xl font-bold text-gray-900">{{ isEdit() ? 'Edit Question' : 'Create Question' }}</h1>
          </div>

          <div class="px-6 py-5 space-y-5">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="form-label" for="topic">Topic</label>
                <select id="topic" class="form-input" [value]="topicId()" (change)="topicId.set($any($event.target).value)">
                  <option value="">Select topic...</option>
                  @for (t of topics(); track t.id) {
                    <option [value]="t.id">{{ t.name }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="form-label" for="difficulty">Difficulty Level</label>
                <select id="difficulty" class="form-input" [value]="difficulty()" (change)="difficulty.set(parseInt($any($event.target).value, 10))">
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                  <option value="4">Level 4</option>
                  <option value="5">Level 5</option>
                </select>
              </div>
            </div>

            <div>
              <label class="form-label" for="body">Question Body</label>
              <textarea id="body" class="form-input min-h-[120px]" placeholder="Enter question text..."
                        [value]="body()" (input)="body.set($any($event.target).value)"></textarea>
            </div>

            <div>
              <label class="form-label">Answer Options</label>
              <div class="space-y-2">
                @for (opt of options(); track opt; let i = $index) {
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-mono text-gray-500 w-6">{{ optionLetters[i] }}</span>
                    <input class="form-input flex-1" placeholder="Option {{ optionLetters[i] }}"
                           [value]="opt" (input)="updateOption(i, $any($event.target).value)" />
                    <button class="p-1 text-red-400 hover:text-red-600" (click)="removeOption(i)" aria-label="Remove option">
                      <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                }
              </div>
              <button class="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium" (click)="addOption()">+ Add Option</button>
            </div>

            <div>
              <label class="form-label" for="correctAnswer">Correct Answer</label>
              <select id="correctAnswer" class="form-input" [value]="correctAnswer()" (change)="correctAnswer.set($any($event.target).value)">
                <option value="">Select correct answer...</option>
                @for (letter of optionLetters.slice(0, options().length); track letter) {
                  <option [value]="letter">{{ letter }}</option>
                }
              </select>
            </div>

            <div>
              <label class="form-label" for="explanation">Explanation</label>
              <textarea id="explanation" class="form-input min-h-[80px]" placeholder="Explain why the correct answer is right..."
                        [value]="explanation()" (input)="explanation.set($any($event.target).value)"></textarea>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3">
            <a routerLink="/expert/questions" class="btn px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</a>
            <button class="btn px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    [disabled]="!canSave() || saving()" (click)="save()">
              @if (saving()) { <app-spinner size="sm" color="neutral" /> }
              {{ isEdit() ? 'Save Changes' : 'Create Question' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class QuestionEditorComponent {
  private readonly questionService = inject(QuestionService);
  private readonly testBankService = inject(TestBankService);
  private readonly topicService = inject(TopicService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly pageLoading = signal(true);
  protected readonly saving = signal(false);
  protected readonly topics = signal<TopicDto[]>([]);
  protected readonly topicId = signal('');
  protected readonly body = signal('');
  protected readonly difficulty = signal(1);
  protected readonly options = signal<string[]>(['', '', '', '']);
  protected readonly correctAnswer = signal('');
  protected readonly explanation = signal('');

  protected readonly optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  protected readonly isEdit = () => !!this.route.snapshot.paramMap.get('id');
  protected readonly canSave = () => !!this.topicId() && !!this.body().trim() && !!this.correctAnswer();

  private questionId = '';

  constructor() {
    this.loadTopics();
  }

  private loadTopics() {
    this.testBankService.getAll({ pageSize: 100 }).subscribe({
      next: (banks) => {
        const allTopics: TopicDto[] = [];
        let loaded = 0;
        if (banks.data.items.length === 0) {
          this.pageLoading.set(false);
          return;
        }
        for (const bank of banks.data.items) {
          this.topicService.getByTestBank(bank.id).subscribe({
            next: (res) => {
              allTopics.push(...res.data);
              loaded++;
              if (loaded === banks.data.items.length) {
                this.topics.set(allTopics);
                this.checkEditMode();
              }
            },
            error: () => {
              loaded++;
              if (loaded === banks.data.items.length) this.checkEditMode();
            },
          });
        }
      },
      error: () => {
        this.pageLoading.set(false);
      },
    });
  }

  private checkEditMode() {
    this.questionId = this.route.snapshot.paramMap.get('id') ?? '';
    if (this.questionId) {
      this.loadQuestion();
    } else {
      const topicId = this.route.snapshot.queryParamMap.get('topicId');
      if (topicId) this.topicId.set(topicId);
      this.pageLoading.set(false);
    }
  }

  private loadQuestion() {
    this.questionService.getById(this.questionId).subscribe({
      next: (res) => {
        const q: QuestionDto = res.data;
        this.topicId.set(q.topicId);
        this.body.set(q.body);
        this.difficulty.set(q.difficultyLevel);
        this.correctAnswer.set(q.correctAnswer);
        this.explanation.set(q.explanation);
        this.pageLoading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load question');
        this.pageLoading.set(false);
      },
    });
  }

    protected parseInt = (v: string, _radix?: number) => Number(v);

  protected updateOption(index: number, value: string) {
    this.options.update((opts) => {
      const newOpts = [...opts];
      newOpts[index] = value;
      return newOpts;
    });
  }

  protected addOption() {
    if (this.options().length >= 6) return;
    this.options.update((opts) => [...opts, '']);
  }

  protected removeOption(index: number) {
    if (this.options().length <= 2) return;
    this.options.update((opts) => opts.filter((_, i) => i !== index));
  }

  protected save() {
    if (!this.canSave() || this.saving()) return;
    this.saving.set(true);

    const dto: CreateQuestionDto = {
      topicId: this.topicId(),
      body: this.body().trim(),
      difficultyLevel: this.difficulty(),
      correctAnswer: this.correctAnswer(),
      explanation: this.explanation().trim(),
      attachments: [],
      options: this.options().map((text, i) => ({
        optionLetter: this.optionLetters[i],
        optionText: text.trim(),
        isCorrect: this.optionLetters[i] === this.correctAnswer(),
        displayOrder: i + 1,
      })),
    };

    const request = this.isEdit()
      ? this.questionService.update(this.questionId, dto)
      : this.questionService.create(dto.topicId, dto);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEdit() ? 'Question updated' : 'Question created');
        this.router.navigate(['/expert/questions']);
      },
      error: () => {
        this.toast.error('Failed to save question');
        this.saving.set(false);
      },
    });
  }
}
