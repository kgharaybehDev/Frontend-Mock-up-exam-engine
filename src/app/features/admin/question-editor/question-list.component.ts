import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuestionService } from '../../../core/services/question.service';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="p-6 max-w-5xl mx-auto space-y-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <a [routerLink]="['/admin/testbanks', testBankId(), 'topics']" class="text-sm text-blue-600 hover:text-blue-800">&larr; Topics</a>
          <h1 class="text-2xl font-bold text-gray-900">Questions</h1>
        </div>
        <a [routerLink]="['/admin/testbanks', testBankId(), 'topics', topicId(), 'questions', 'new']" class="btn btn-full w-auto">+ New Question</a>
      </div>

      @if (loading()) {
        <div class="text-center py-12 text-gray-400">Loading questions...</div>
      } @else if (error()) {
        <div class="text-center py-12 text-red-500">{{ error() }}</div>
      } @else {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          @for (q of questions(); track q.id) {
            <div class="px-5 py-4 hover:bg-gray-50 transition-colors" [class.opacity-60]="!q.isActive">
              <div class="flex flex-col sm:flex-row sm:items-start gap-3">
                <div class="flex-1 min-w-0 overflow-hidden space-y-2">
                  <div class="flex items-start gap-2">
                    <a [routerLink]="['/admin/testbanks', testBankId(), 'topics', topicId(), 'questions', q.id, 'edit']" class="text-sm font-semibold text-blue-600 hover:text-blue-800 min-w-0 break-all [&>p]:inline [&>p]:m-0 [&>div]:inline [&>div]:m-0" [innerHTML]="q.body"></a>
                    @if (!q.isActive) {
                      <span class="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 shrink-0 mt-0.5">Inactive</span>
                    }
                  </div>
                  @if (q.options?.length) {
                    <div class="space-y-1">
                      @for (opt of q.options; track opt.optionLetter) {
                        <div class="text-xs min-w-0 break-all" [class.text-green-700]="opt.isCorrect" [class.font-semibold]="opt.isCorrect" [class.text-gray-500]="!opt.isCorrect">
                          <span [class.font-bold]="opt.isCorrect">{{ opt.optionLetter }}.</span>
                          @if (opt.isCorrect) {
                            <span class="mr-0.5">&#10003;</span>
                          }
                          <span [innerHTML]="opt.optionText" class="[&>p]:inline [&>p]:m-0"></span>
                        </div>
                      }
                    </div>
                  }
                  <p class="text-xs text-gray-400">Correct: {{ q.correctAnswer }} &middot; Lvl {{ q.difficultyLevel }}</p>
                </div>
                <button
                  type="button"
                  class="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 self-start sm:self-auto"
                  [class.bg-blue-600]="q.isActive"
                  [class.bg-gray-200]="!q.isActive"
                  (click)="toggleActive(q)"
                >
                  <span class="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform" [class.translate-x-5]="q.isActive" [class.translate-x-0]="!q.isActive"></span>
                </button>
              </div>
            </div>
          } @empty {
            <div class="px-5 py-12 text-center text-sm text-gray-400">No questions yet. Click "+ New Question" to create one.</div>
          }
        </div>
      }
    </div>
  `,
})
export class QuestionListComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly questionService = inject(QuestionService);

  protected readonly testBankId = signal('');
  protected readonly topicId = signal('');
  protected readonly questions = signal<any[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit() {
    const topicId = this.route.snapshot.paramMap.get('topicId');
    const testBankId = this.route.snapshot.paramMap.get('testBankId');
    if (topicId && testBankId) {
      this.topicId.set(topicId);
      this.testBankId.set(testBankId);
      this.loadQuestions(topicId);
    }
  }

  private loadQuestions(topicId: string) {
    this.loading.set(true);
    this.questionService.getByTopic(topicId).subscribe({
      next: (res: any) => { this.questions.set(res.data?.items ?? []); this.loading.set(false); },
      error: () => { this.error.set('Failed to load questions.'); this.loading.set(false); },
    });
  }

  protected toggleActive(q: any) {
    this.questionService.toggleActive(q.id).subscribe({ next: () => this.loadQuestions(this.topicId()) });
  }
}
