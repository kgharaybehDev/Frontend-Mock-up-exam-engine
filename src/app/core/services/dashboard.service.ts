import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse, PagedResult } from '../models/api-response.model';
import type { ExamListItemDto } from '../models/exam.model';
import type { CandidateAttemptDto } from '../models/attempt.model';
import { API_BASE_URL } from '../tokens/api-url.token';

export interface DashboardStats {
  totalExamsTaken: number;
  averageScore: number;
  passedExams: number;
  totalExams: number;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  readonly recentAttempts = signal<CandidateAttemptDto[]>([]);
  readonly examCatalog = signal<ExamListItemDto[]>([]);
  readonly isLoading = signal(false);

  readonly stats = computed<DashboardStats>(() => {
    const attempts = this.recentAttempts();
    const completed = attempts.filter((a) => a.status === 'completed');
    const passed = completed.filter((a) => a.passed === true);
    const avgScore = completed.length > 0
      ? Math.round(completed.reduce((sum, a) => sum + (a.score ?? 0), 0) / completed.length)
      : 0;
    return {
      totalExamsTaken: completed.length,
      averageScore: avgScore,
      passedExams: passed.length,
      totalExams: this.examCatalog().length,
    };
  });

  getExamCatalog() {
    this.isLoading.set(true);
    return this.http.get<ApiResponse<PagedResult<ExamListItemDto>>>(`${this.apiBase}/api/v1/exams`);
  }

  addRecentAttempt(attempt: CandidateAttemptDto) {
    this.recentAttempts.update((list) => [attempt, ...list].slice(0, 10));
  }
}
