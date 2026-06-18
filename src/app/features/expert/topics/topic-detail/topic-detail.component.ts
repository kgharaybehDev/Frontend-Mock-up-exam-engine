import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { TopicService } from '../../../../core/services/topic.service';
import { QuestionService } from '../../../../core/services/question.service';
import { TestBankService } from '../../../../core/services/test-bank.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import type { TopicDto, QuestionDto } from '../../../../core/models/exam.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-topic-detail',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
    } @else {
      <div class="space-y-6">
        <div class="flex items-center gap-3 text-sm text-gray-500">
          <a routerLink="/expert/topics" class="hover:text-blue-600">Topics</a>
          <span>/</span>
          <span class="text-gray-900 font-medium">{{ topic()?.name }}</span>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold text-gray-900">{{ topic()?.name }}</h1>
              <p class="text-sm text-gray-500 mt-1">{{ topic()?.description }}</p>
            </div>
            <div class="flex items-center gap-3">
              <a [routerLink]="['/expert/topics', topicId, 'edit']" class="btn px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg">
                Edit
              </a>
              <a [routerLink]="['/expert/questions/new']" [queryParams]="{ topicId: topicId }" class="btn px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg">
                + Add Question
              </a>
            </div>
          </div>
          <div class="px-6 py-4 flex items-center gap-6">
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ topic()?.totalQuestions }}</p>
              <p class="text-xs text-gray-500">Questions</p>
            </div>
            <div class="text-center">
              <p class="text-2xl font-bold text-gray-900">{{ testBankName() }}</p>
              <p class="text-xs text-gray-500">Test Bank</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-gray-900">Questions ({{ questions().length }})</h2>
          </div>
          @if (questionsLoading()) {
            <div class="flex justify-center py-8"><app-spinner /></div>
          } @else if (questions().length === 0) {
            <div class="px-6 py-8 text-center text-sm text-gray-500">
              No questions in this topic yet.
            </div>
          } @else {
            <div class="divide-y divide-gray-50">
              @for (q of questions(); track q.id) {
                <div class="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ q.body }}</p>
                    <div class="flex items-center gap-3 mt-0.5">
                      <span class="text-xs text-gray-500">Difficulty: {{ q.difficultyLevel }}</span>
                      <span class="text-xs" [class.text-green-600]="q.isActive" [class.text-red-500]="!q.isActive">
                        {{ q.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </div>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <a [routerLink]="['/expert/questions', q.id, 'preview']" class="text-xs text-blue-600 hover:text-blue-800">Preview</a>
                    <a [routerLink]="['/expert/questions', q.id, 'edit']" class="text-xs text-blue-600 hover:text-blue-800">Edit</a>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class TopicDetailComponent {
  private readonly topicService = inject(TopicService);
  private readonly questionService = inject(QuestionService);
  private readonly testBankService = inject(TestBankService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly topic = signal<TopicDto | null>(null);
  protected readonly questions = signal<QuestionDto[]>([]);
  protected readonly testBankName = signal('');
  protected readonly loading = signal(true);
  protected readonly questionsLoading = signal(true);

  protected topicId = '';

  constructor() {
    this.topicId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.topicId) {
      this.router.navigate(['/expert/topics']);
      return;
    }
    this.loadTopic();
  }

  private loadTopic() {
    this.testBankService.getAll({ pageSize: 100 }).subscribe({
      next: (banks) => {
        for (const bank of banks.data.items) {
          this.topicService.getById(bank.id, this.topicId).subscribe({
            next: (res) => {
              this.topic.set(res.data);
              this.testBankName.set(bank.name);
              this.loading.set(false);
              if (res.data) this.loadQuestions(res.data.id);
            },
            error: () => {
              this.topicService.getByTestBank(bank.id).subscribe({
                next: (topics) => {
                  const found = topics.data.find((t) => t.id === this.topicId);
                  if (found) {
                    this.topic.set(found);
                    this.testBankName.set(bank.name);
                    this.loading.set(false);
                    this.loadQuestions(found.id);
                  }
                },
              });
            },
          });
        }
      },
      error: () => {
        this.toast.error('Failed to load topic');
        this.loading.set(false);
      },
    });
  }

  private loadQuestions(topicId: string) {
    this.questionsLoading.set(true);
    this.questionService.getByTopic(topicId, { pageSize: 100 }).subscribe({
      next: (res) => {
        this.questions.set(res.data.items);
        this.questionsLoading.set(false);
      },
      error: () => {
        this.questionsLoading.set(false);
      },
    });
  }
}
