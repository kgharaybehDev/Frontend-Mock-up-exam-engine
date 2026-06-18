import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { GradingService } from '../../../core/services/grading.service';
import { DashboardCardComponent } from '../../../shared/components/dashboard-card/dashboard-card.component';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import type { AttemptSummaryDto } from '../../../core/models/attempt.model';

@Component({
  selector: 'app-expert-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe, DashboardCardComponent, SpinnerComponent],
  template: `
    <div class="space-y-6">
      <h1 class="text-2xl font-bold text-gray-900">Expert Dashboard</h1>

      @if (loading()) {
        <div class="flex justify-center py-12"><app-spinner size="lg" /></div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <app-dashboard-card label="Total Questions" [value]="stats().totalQuestions" iconBg="bg-blue-50 text-blue-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </app-dashboard-card>
          <app-dashboard-card label="Total Exams" [value]="stats().totalExams" iconBg="bg-emerald-50 text-emerald-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </app-dashboard-card>
          <app-dashboard-card label="Graded Attempts" [value]="stats().gradedAttempts" iconBg="bg-amber-50 text-amber-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </app-dashboard-card>
          <app-dashboard-card label="Pending Grading" [value]="stats().pendingGrading" iconBg="bg-red-50 text-red-600">
            <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </app-dashboard-card>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="px-5 py-4 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Recent Questions</h2>
            </div>
            <div class="px-5 py-6 text-sm text-gray-500 text-center">No questions yet.</div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200">
            <div class="px-5 py-4 border-b border-gray-100">
              <h2 class="text-lg font-semibold text-gray-900">Pending Grading</h2>
            </div>
            @if (pendingAttempts().length === 0) {
              <div class="px-5 py-6 text-sm text-gray-500 text-center">No pending grading.</div>
            } @else {
              <div class="divide-y divide-gray-50">
                @for (a of pendingAttempts(); track a.attemptId) {
                  <div class="px-5 py-3 flex items-center justify-between">
                    <div>
                      <span class="text-sm font-medium text-gray-900">{{ a.candidateName }}</span>
                      <span class="text-xs text-gray-500 ml-2">{{ a.startedAt | date: 'short' }}</span>
                    </div>
                    <a routerLink="/expert/grading" class="text-xs text-blue-600 hover:text-blue-800 font-medium">Grade</a>
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <div class="flex items-center gap-4 flex-wrap">
          <a routerLink="/expert/questions/new" class="btn px-5 py-2.5 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 rounded-lg">
            + New Question
          </a>
          <a routerLink="/expert/exams/new" class="btn px-5 py-2.5 bg-white text-blue-600 border border-blue-300 text-sm font-medium hover:bg-blue-50 rounded-lg">
            + New Exam
          </a>
          <a routerLink="/expert/grading" class="btn px-5 py-2.5 bg-white text-blue-600 border border-blue-300 text-sm font-medium hover:bg-blue-50 rounded-lg">
            Grade Attempts
          </a>
        </div>
      }
    </div>
  `,
})
export class DashboardComponent {
  private readonly gradingService = inject(GradingService);

  protected readonly pendingAttempts = signal<AttemptSummaryDto[]>([]);
  protected readonly loading = signal(true);

  protected readonly stats = computed(() => {
    const pending = this.pendingAttempts().length;
    return { totalQuestions: 0, totalExams: 0, gradedAttempts: 0, pendingGrading: pending };
  });

  constructor() {
    this.loadData();
  }

  private loadData() {
    this.loading.set(false);

    this.gradingService.getPendingGrading({ pageSize: 5 }).subscribe({
      next: (res) => this.pendingAttempts.set(res.data.items),
      error: () => {},
    });
  }
}
