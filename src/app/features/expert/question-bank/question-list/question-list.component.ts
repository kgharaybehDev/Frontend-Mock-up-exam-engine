import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../../../core/services/question.service';
import { TestBankService } from '../../../../core/services/test-bank.service';
import { TopicService } from '../../../../core/services/topic.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import type { QuestionDto, TestBankDto, TopicDto } from '../../../../core/models/exam.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ModalComponent } from '../../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-question-list',
  standalone: true,
  imports: [RouterLink, SpinnerComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Question Bank</h1>
        <a routerLink="/expert/questions/new" class="btn px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg">
          + New Question
        </a>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center gap-4">
          <div class="flex-1">
            <input class="form-input" placeholder="Search questions..." [value]="search()" (input)="search.set($any($event.target).value); loadQuestions()" />
          </div>
          <select class="form-input w-auto" [value]="selectedTopicId()" (change)="onTopicChange($event)">
            <option value="">All Topics</option>
            @for (t of topics(); track t.id) {
              <option [value]="t.id">{{ t.name }}</option>
            }
          </select>
          <select class="form-input w-auto" [value]="difficultyFilter()" (change)="difficultyFilter.set($any($event.target).value); loadQuestions()">
            <option value="">All Difficulties</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
        </div>

        @if (loading()) {
          <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
        } @else if (questions().length === 0) {
          <div class="px-5 py-12 text-center text-sm text-gray-500">
            No questions found.
            <a routerLink="/expert/questions/new" class="text-blue-600 hover:text-blue-800 font-medium block mt-2">Create your first question</a>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th class="px-5 py-3">Question</th>
                  <th class="px-5 py-3">Topic</th>
                  <th class="px-5 py-3">Difficulty</th>
                  <th class="px-5 py-3">Status</th>
                  <th class="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (q of questions(); track q.id) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-5 py-3">
                      <span class="text-sm text-gray-900 line-clamp-2">{{ q.body }}</span>
                    </td>
                    <td class="px-5 py-3 text-sm text-gray-500">{{ q.topicName }}</td>
                    <td class="px-5 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            [class.bg-blue-50]="q.difficultyLevel <= 2"
                            [class.text-blue-700]="q.difficultyLevel <= 2"
                            [class.bg-amber-50]="q.difficultyLevel === 3"
                            [class.text-amber-700]="q.difficultyLevel === 3"
                            [class.bg-red-50]="q.difficultyLevel >= 4"
                            [class.text-red-700]="q.difficultyLevel >= 4">
                        Level {{ q.difficultyLevel }}
                      </span>
                    </td>
                    <td class="px-5 py-3">
                      <span class="inline-flex items-center gap-1 text-xs"
                            [class.text-green-600]="q.isActive"
                            [class.text-red-500]="!q.isActive">
                        <span class="h-1.5 w-1.5 rounded-full" [class.bg-green-500]="q.isActive" [class.bg-red-500]="!q.isActive"></span>
                        {{ q.isActive ? 'Active' : 'Inactive' }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <a [routerLink]="['/expert/questions', q.id, 'preview']" class="text-xs text-blue-600 hover:text-blue-800">Preview</a>
                        <a [routerLink]="['/expert/questions', q.id, 'edit']" class="text-xs text-blue-600 hover:text-blue-800">Edit</a>
                        <button class="text-xs text-red-600 hover:text-red-800" (click)="confirmDelete(q)">Delete</button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        @if (totalPages() > 1) {
          <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between text-sm">
            <span class="text-gray-500">Page {{ currentPage() }} of {{ totalPages() }}</span>
            <div class="flex items-center gap-2">
              <button class="btn px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                      [disabled]="currentPage() <= 1" (click)="goToPage(currentPage() - 1)">Prev</button>
              <button class="btn px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50"
                      [disabled]="currentPage() >= totalPages()" (click)="goToPage(currentPage() + 1)">Next</button>
            </div>
          </div>
        }
      </div>
    </div>

    @if (deleteTarget()) {
      <app-modal [open]="!!deleteTarget()" title="Delete Question" (dismiss)="deleteTarget.set(null)">
        <p class="text-sm text-gray-600">Are you sure you want to delete this question? This action cannot be undone.</p>
        <div modal-footer class="flex justify-end gap-2">
          <button class="btn px-4 py-2 text-sm border border-gray-300 rounded-md" (click)="deleteTarget.set(null)">Cancel</button>
          <button class="btn px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700" (click)="deleteQuestion()">Delete</button>
        </div>
      </app-modal>
    }
  `,
})
export class QuestionListComponent {
  private readonly questionService = inject(QuestionService);
  private readonly testBankService = inject(TestBankService);
  private readonly topicService = inject(TopicService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  protected readonly questions = signal<QuestionDto[]>([]);
  protected readonly topics = signal<TopicDto[]>([]);
  protected readonly search = signal('');
  protected readonly selectedTopicId = signal('');
  protected readonly difficultyFilter = signal('');
  protected readonly loading = signal(true);
  protected readonly currentPage = signal(1);
  protected readonly totalPages = signal(1);
  protected readonly deleteTarget = signal<QuestionDto | null>(null);

  constructor() {
    this.loadTopics();
    this.loadQuestions();
  }

  private loadTopics() {
    this.testBankService.getAll({ pageSize: 100 }).subscribe({
      next: (banks) => {
        const allTopics: TopicDto[] = [];
        let loaded = 0;
        for (const bank of banks.data.items) {
          this.topicService.getByTestBank(bank.id).subscribe({
            next: (res) => {
              allTopics.push(...res.data);
              loaded++;
              if (loaded === banks.data.items.length) {
                this.topics.set(allTopics);
              }
            },
            error: () => {
              loaded++;
            },
          });
        }
      },
    });
  }

  protected loadQuestions() {
    this.loading.set(true);
    const topicId = this.selectedTopicId();
    const difficulty = this.difficultyFilter() ? parseInt(this.difficultyFilter(), 10) : undefined;
    if (topicId) {
      this.questionService.getByTopic(topicId, { difficulty, page: this.currentPage(), pageSize: 20 }).subscribe({
        next: (res) => {
          this.questions.set(res.data.items);
          this.totalPages.set(Math.ceil(res.data.totalCount / res.data.pageSize));
          this.loading.set(false);
        },
        error: () => {
          this.toast.error('Failed to load questions');
          this.loading.set(false);
        },
      });
    } else {
      this.questions.set([]);
      this.totalPages.set(1);
      this.loading.set(false);
    }
  }

  protected onTopicChange(event: Event) {
    this.selectedTopicId.set((event.target as any).value);
    this.currentPage.set(1);
    this.loadQuestions();
  }

  protected goToPage(page: number) {
    this.currentPage.set(page);
    this.loadQuestions();
  }

  protected confirmDelete(q: QuestionDto) {
    this.deleteTarget.set(q);
  }

  protected deleteQuestion() {
    const target = this.deleteTarget();
    if (!target) return;
    this.questionService.delete(target.id).subscribe({
      next: () => {
        this.toast.success('Question deleted');
        this.deleteTarget.set(null);
        this.loadQuestions();
      },
      error: () => {
        this.toast.error('Failed to delete question');
        this.deleteTarget.set(null);
      },
    });
  }
}
