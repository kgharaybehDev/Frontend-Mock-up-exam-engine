import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { GradingService } from '../../../core/services/grading.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import type { AttemptSummaryDto } from '../../../core/models/attempt.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-grading',
  standalone: true,
  imports: [DatePipe, SpinnerComponent, ModalComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Manual Grading</h1>
        <button class="btn px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg"
                (click)="loadPending()" [disabled]="loading()">
          Refresh
        </button>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        @if (loading()) {
          <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
        } @else if (pendingAttempts().length === 0) {
          <div class="px-5 py-12 text-center">
            <svg class="h-12 w-12 text-gray-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="text-sm text-gray-500">No pending grading items.</p>
            <p class="text-xs text-gray-400 mt-1">All attempts have been graded.</p>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th class="px-5 py-3">Candidate</th>
                  <th class="px-5 py-3">Started</th>
                  <th class="px-5 py-3">Status</th>
                  <th class="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (a of pendingAttempts(); track a.attemptId) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-5 py-3">
                      <span class="text-sm font-medium text-gray-900">{{ a.candidateName }}</span>
                    </td>
                    <td class="px-5 py-3 text-sm text-gray-500">{{ a.startedAt | date: 'medium' }}</td>
                    <td class="px-5 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700">
                        {{ a.status }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-right">
                      <button class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              (click)="startGrading(a)">Grade</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>

    <div class="grid grid-cols-1 gap-4 mt-6">
      @for (q of gradeQueue(); track q.attemptQuestionId) {
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <p class="text-sm text-gray-500">Question {{ q.index + 1 }}</p>
              <p class="text-sm font-medium text-gray-900 mt-0.5">{{ q.body }}</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div class="flex-1">
              <label class="text-xs font-medium text-gray-500">Score (0-100)</label>
              <input type="number" class="form-input" min="0" max="100"
                     [value]="q.score" (input)="updateGrade(q.attemptQuestionId, +$any($event.target).value, q.feedback)" />
            </div>
            <div class="flex-1">
              <label class="text-xs font-medium text-gray-500">Feedback</label>
              <input class="form-input" placeholder="Optional feedback"
                     [value]="q.feedback" (input)="updateGrade(q.attemptQuestionId, q.score, $any($event.target).value)" />
            </div>
          </div>
        </div>
      }
    </div>

    @if (gradeQueue().length > 0) {
      <div class="flex justify-end">
        <button class="btn px-5 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg disabled:opacity-50"
                [disabled]="submitting()" (click)="submitGrades()">
          @if (submitting()) { <app-spinner size="sm" color="neutral" /> }
          Submit Grades
        </button>
      </div>
    }
  `,
})
export class GradingComponent {
  private readonly gradingService = inject(GradingService);
  private readonly toast = inject(ToastService);

  protected readonly pendingAttempts = signal<AttemptSummaryDto[]>([]);
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);

  protected readonly gradeQueue = signal<{ attemptQuestionId: string; index: number; body: string; score: number; feedback: string }[]>([]);
  protected gradingAttemptId = '';

  constructor() {
    this.loadPending();
  }

  protected loadPending() {
    this.loading.set(true);
    this.gradingService.getPendingGrading({ pageSize: 50 }).subscribe({
      next: (res) => {
        this.pendingAttempts.set(res.data.items);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load pending grading');
        this.loading.set(false);
      },
    });
  }

  protected startGrading(attempt: AttemptSummaryDto) {
    this.gradingAttemptId = attempt.attemptId;
    this.gradeQueue.set([
      { attemptQuestionId: 'q1', index: 0, body: `Question for ${attempt.candidateName}`, score: 0, feedback: '' },
    ]);
  }

  protected updateGrade(questionId: string, score: number, feedback: string) {
    this.gradeQueue.update((items) =>
      items.map((q) => (q.attemptQuestionId === questionId ? { ...q, score, feedback } : q)),
    );
  }

  protected submitGrades() {
    this.submitting.set(true);
    this.gradingService.gradeAttempt(this.gradingAttemptId, {
      questionGrades: this.gradeQueue().map((q) => ({
        attemptQuestionId: q.attemptQuestionId,
        score: q.score,
        feedback: q.feedback,
      })),
    }).subscribe({
      next: () => {
        this.toast.success('Grades submitted');
        this.gradeQueue.set([]);
        this.submitting.set(false);
        this.loadPending();
      },
      error: () => {
        this.toast.error('Failed to submit grades');
        this.submitting.set(false);
      },
    });
  }
}
