import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GradingService } from '../../../core/services/grading.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import type { AttemptSummaryDto } from '../../../core/models/attempt.model';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-candidate-results',
  standalone: true,
  imports: [RouterLink, DatePipe, SpinnerComponent],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Candidate Results</h1>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        @if (loading()) {
          <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
        } @else if (attempts().length === 0) {
          <div class="px-5 py-12 text-center text-sm text-gray-500">
            No candidate results yet.
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <th class="px-5 py-3">Candidate</th>
                  <th class="px-5 py-3">Status</th>
                  <th class="px-5 py-3">Score</th>
                  <th class="px-5 py-3">Result</th>
                  <th class="px-5 py-3">Date</th>
                  <th class="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (a of attempts(); track a.attemptId) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-5 py-3">
                      <span class="text-sm font-medium text-gray-900">{{ a.candidateName }}</span>
                      <span class="text-xs text-gray-500 block">{{ a.candidateId }}</span>
                    </td>
                    <td class="px-5 py-3">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                            [class.bg-blue-50]="a.status === 'in-progress'"
                            [class.text-blue-700]="a.status === 'in-progress'"
                            [class.bg-green-50]="a.status === 'completed'"
                            [class.text-green-700]="a.status === 'completed'"
                            [class.bg-gray-50]="a.status === 'pending'"
                            [class.text-gray-700]="a.status === 'pending'">
                        {{ a.status }}
                      </span>
                    </td>
                    <td class="px-5 py-3 text-sm text-gray-900">
                      {{ a.score !== null ? a.score + '%' : '—' }}
                    </td>
                    <td class="px-5 py-3">
                      @if (a.passed === true) {
                        <span class="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Passed
                        </span>
                      } @else if (a.passed === false) {
                        <span class="inline-flex items-center gap-1 text-xs font-medium text-red-700">
                          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Failed
                        </span>
                      } @else {
                        <span class="text-xs text-gray-400">—</span>
                      }
                    </td>
                    <td class="px-5 py-3 text-sm text-gray-500">
                      {{ a.completedAt ? (a.completedAt | date: 'mediumDate') : (a.startedAt | date: 'mediumDate') }}
                    </td>
                    <td class="px-5 py-3 text-right">
                      <button class="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              (click)="viewDetail(a)">View Details</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </div>
  `,
})
export class CandidateResultsComponent {
  private readonly gradingService = inject(GradingService);
  private readonly toast = inject(ToastService);

  protected readonly attempts = signal<AttemptSummaryDto[]>([]);
  protected readonly loading = signal(true);

  constructor() {
    this.gradingService.getPendingGrading({ pageSize: 100 }).subscribe({
      next: (res) => {
        this.attempts.set(res.data.items);
        this.loading.set(false);
      },
      error: () => {
        this.toast.error('Failed to load results');
        this.loading.set(false);
      },
    });
  }

  protected viewDetail(a: AttemptSummaryDto) {
    this.toast.info(`Viewing details for ${a.candidateName}`);
  }
}
