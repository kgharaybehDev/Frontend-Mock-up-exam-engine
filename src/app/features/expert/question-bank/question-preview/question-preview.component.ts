import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { QuestionService } from '../../../../core/services/question.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import type { QuestionDto } from '../../../../core/models/exam.model';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-question-preview',
  standalone: true,
  imports: [RouterLink, SpinnerComponent],
  template: `
    @if (loading()) {
      <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
    } @else if (!question()) {
      <div class="text-center py-12 text-gray-500">Question not found.</div>
    } @else {
      <div class="max-w-4xl mx-auto">
        <div class="flex items-center gap-3 text-sm text-gray-500 mb-4">
          <a routerLink="/expert/questions" class="hover:text-blue-600">Questions</a>
          <span>/</span>
          <span class="text-gray-900 font-medium">Preview</span>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-200">
          @let q = question()!;
          <div class="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h1 class="text-lg font-bold text-gray-900">Question Preview</h1>
            <a [routerLink]="['/expert/questions', q.id, 'edit']" class="text-sm text-blue-600 hover:text-blue-800 font-medium">Edit</a>
          </div>
          <div class="px-6 py-5 space-y-6">
            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Topic</label>
              <p class="text-sm text-gray-900 mt-1">{{ q.topicName }}</p>
            </div>

            <div class="flex items-center gap-4">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                Level {{ q.difficultyLevel }}
              </span>
              <span class="inline-flex items-center gap-1 text-xs"
                    [class.text-green-600]="q.isActive" [class.text-red-500]="!q.isActive">
                <span class="h-1.5 w-1.5 rounded-full" [class.bg-green-500]="q.isActive" [class.bg-red-500]="!q.isActive"></span>
                {{ q.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Question</label>
              <p class="text-sm text-gray-900 mt-1 whitespace-pre-wrap">{{ q.body }}</p>
            </div>

            <div>
              <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Answer Options</label>
              <div class="mt-2 space-y-2">
                @if (q.attachments && q.attachments.length > 0) {
                  @for (opt of q.attachments; track opt.id) {
                    <div class="flex items-center gap-3 p-3 rounded-lg border"
                         [class.border-green-500 bg-green-50]="opt.altText === q.correctAnswer"
                         [class.border-gray-200]="opt.altText !== q.correctAnswer">
                      <span class="text-sm font-mono font-bold text-gray-500">{{ opt.altText }}</span>
                      <span class="text-sm text-gray-900">{{ opt.filePathUrl }}</span>
                      @if (opt.altText === q.correctAnswer) {
                        <span class="ml-auto text-xs font-medium text-green-700">Correct Answer</span>
                      }
                    </div>
                  }
                } @else {
                  @for (letter of ['A', 'B', 'C', 'D', 'E', 'F']; track letter) {
                    <div class="flex items-center gap-3 p-3 rounded-lg border"
                         [class.border-green-500 bg-green-50]="letter === q.correctAnswer"
                         [class.border-gray-200]="letter !== q.correctAnswer">
                      <span class="text-sm font-mono font-bold text-gray-500">{{ letter }}</span>
                      <span class="text-sm text-gray-900">Option {{ letter }}</span>
                      @if (letter === q.correctAnswer) {
                        <span class="ml-auto text-xs font-medium text-green-700">Correct Answer</span>
                      }
                    </div>
                  }
                }
              </div>
            </div>

            @if (q.explanation) {
              <div>
                <label class="text-xs font-medium text-gray-500 uppercase tracking-wider">Explanation</label>
                <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap bg-gray-50 rounded-lg p-4">{{ q.explanation }}</p>
              </div>
            }
          </div>

          <div class="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex items-center justify-between">
            <a routerLink="/expert/questions" class="btn px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">&larr; Back to Questions</a>
            <div class="flex items-center gap-2">
              <a [routerLink]="['/expert/questions', q.id, 'edit']" class="btn px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg">Edit Question</a>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class QuestionPreviewComponent {
  private readonly questionService = inject(QuestionService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly question = signal<QuestionDto | null>(null);
  protected readonly loading = signal(true);

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/expert/questions']);
      return;
    }
    this.questionService.getById(id).subscribe({
      next: (res) => {
        this.question.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load question');
        this.loading.set(false);
      },
    });
  }
}
