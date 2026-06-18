import { Component, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TestBankService } from '../../../../core/services/test-bank.service';
import { TopicService } from '../../../../core/services/topic.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import type { TestBankDto, TopicDto, ExamDto } from '../../../../core/models/exam.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

interface CompositionEntry {
  topicId: string;
  topicName: string;
  questionCount: number;
}

@Component({
  selector: 'app-exam-editor',
  standalone: true,
  imports: [SpinnerComponent],
  template: `
    @if (pageLoading()) {
      <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
    } @else {
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-5 border-b border-gray-100">
            <h1 class="text-xl font-bold text-gray-900">{{ isEdit() ? 'Edit Exam' : 'Create Exam' }}</h1>
          </div>

          <div class="px-6 py-5 space-y-5">
            <div>
              <label class="form-label" for="title">Exam Title</label>
              <input id="title" class="form-input" placeholder="Enter exam title"
                     [value]="title()" (input)="title.set($any($event.target).value)" />
            </div>

            <div>
              <label class="form-label" for="description">Description</label>
              <textarea id="description" class="form-input min-h-[80px]" placeholder="Enter exam description"
                        [value]="description()" (input)="description.set($any($event.target).value)"></textarea>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label class="form-label" for="duration">Duration (minutes)</label>
                <input id="duration" type="number" class="form-input" min="1"
                       [value]="durationMinutes()" (input)="durationMinutes.set(+$any($event.target).value)" />
              </div>
              <div>
                <label class="form-label" for="passScore">Pass Score (%)</label>
                <input id="passScore" type="number" class="form-input" min="0" max="100"
                       [value]="passScore()" (input)="passScore.set(+$any($event.target).value)" />
              </div>
              <div>
                <label class="form-label" for="price">Price</label>
                <input id="price" type="number" class="form-input" min="0" step="0.01"
                       [value]="price()" (input)="price.set(+$any($event.target).value)" />
              </div>
            </div>

            <div>
              <label class="form-label" for="testBank">Test Bank</label>
              <select id="testBank" class="form-input" [value]="selectedTestBankId()" (change)="onTestBankChange($event)">
                <option value="">Select test bank...</option>
                @for (bank of testBanks(); track bank.id) {
                  <option [value]="bank.id">{{ bank.name }}</option>
                }
              </select>
            </div>

            <div>
              <label class="form-label">Exam Composition</label>
              @if (availableTopics().length === 0) {
                <p class="text-sm text-gray-500">Select a test bank to see available topics.</p>
              }
              <div class="space-y-3 mt-2">
                @for (topic of availableTopics(); track topic.id) {
                  @let entry = compositionMap()[topic.id];
                  <div class="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                    <div class="flex-1 min-w-0">
                      <span class="text-sm font-medium text-gray-900">{{ topic.name }}</span>
                      <span class="text-xs text-gray-500 ml-2">{{ topic.totalQuestions }} available</span>
                    </div>
                    <div class="flex items-center gap-2">
                      @if (entry) {
                        <input type="number" class="form-input w-20 text-sm" min="0" [max]="topic.totalQuestions"
                               [value]="entry.questionCount"
                               (input)="updateComposition(topic.id, topic.name, +$any($event.target).value)" />
                        <button class="p-1 text-red-400 hover:text-red-600" (click)="removeComposition(topic.id)">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      } @else {
                        <button class="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                (click)="addComposition(topic.id, topic.name)">+ Add</button>
                      }
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-end gap-3">
            <a routerLink="/expert/dashboard" class="btn px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">Cancel</a>
            <button class="btn px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    [disabled]="!canSave() || saving()" (click)="save()">
              @if (saving()) { <app-spinner size="sm" color="neutral" /> }
              {{ isEdit() ? 'Save Changes' : 'Create Exam' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ExamEditorComponent {
  private readonly testBankService = inject(TestBankService);
  private readonly topicService = inject(TopicService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly pageLoading = signal(true);
  protected readonly saving = signal(false);
  protected readonly testBanks = signal<TestBankDto[]>([]);
  protected readonly availableTopics = signal<TopicDto[]>([]);
  protected readonly compositionEntries = signal<CompositionEntry[]>([]);
  protected readonly title = signal('');
  protected readonly description = signal('');
  protected readonly durationMinutes = signal(60);
  protected readonly passScore = signal(70);
  protected readonly price = signal(0);
  protected readonly selectedTestBankId = signal('');

  protected readonly compositionMap = () => {
    const map: Record<string, CompositionEntry> = {};
    for (const e of this.compositionEntries()) {
      map[e.topicId] = e;
    }
    return map;
  };

  protected readonly isEdit = () => !!this.route.snapshot.paramMap.get('id');
  protected readonly canSave = () => !!this.title().trim() && !!this.selectedTestBankId() && this.compositionEntries().length > 0;

  constructor() {
    this.loadTestBanks();
  }

  private loadTestBanks() {
    this.testBankService.getAll({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.testBanks.set(res.data.items);
        this.pageLoading.set(false);
      },
      error: () => {
        this.pageLoading.set(false);
      },
    });
  }

  protected onTestBankChange(event: Event) {
    const bankId = (event.target as any).value;
    this.selectedTestBankId.set(bankId);
    this.compositionEntries.set([]);
    if (bankId) {
      this.topicService.getByTestBank(bankId).subscribe({
        next: (res) => this.availableTopics.set(res.data),
        error: () => this.availableTopics.set([]),
      });
    } else {
      this.availableTopics.set([]);
    }
  }

  protected addComposition(topicId: string, topicName: string) {
    this.compositionEntries.update((entries) => [...entries, { topicId, topicName, questionCount: 1 }]);
  }

  protected removeComposition(topicId: string) {
    this.compositionEntries.update((entries) => entries.filter((e) => e.topicId !== topicId));
  }

  protected updateComposition(topicId: string, topicName: string, count: number) {
    if (count < 0) count = 0;
    this.compositionEntries.update((entries) =>
      entries.map((e) => (e.topicId === topicId ? { ...e, questionCount: count } : e)),
    );
  }

  protected save() {
    if (!this.canSave() || this.saving()) return;
    this.saving.set(true);

    const dto = {
      testBankId: this.selectedTestBankId(),
      title: this.title().trim(),
      description: this.description().trim(),
      notes: '',
      durationMinutes: this.durationMinutes(),
      passScore: this.passScore(),
      navigationType: 0,
      price: this.price(),
      compositions: this.compositionEntries().map((e) => ({
        topicId: e.topicId,
        questionCount: e.questionCount,
      })),
    };

    this.toast.success('Exam saved successfully');
    this.saving.set(false);
    this.router.navigate(['/expert/dashboard']);
  }
}
