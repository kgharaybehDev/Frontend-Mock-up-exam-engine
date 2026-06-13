import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import type { ApiResponse } from '../models/api-response.model';
import type { QuestionProgressDto } from '../models/question-progress.model';
import { API_BASE_URL } from '../tokens/api-url.token';

@Injectable({ providedIn: 'root' })
export class ExamProgressService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  readonly progressItems = signal<QuestionProgressDto[]>([]);

  private readonly progressMap = computed(() => {
    const map = new Map<string, QuestionProgressDto>();
    for (const item of this.progressItems()) {
      map.set(item.attemptQuestionId, item);
    }
    return map;
  });

  readonly answeredCount = computed(() =>
    this.progressItems().filter((i) => i.status !== 'Unanswered').length,
  );

  readonly totalCount = computed(() => this.progressItems().length);

  loadProgress(attemptId: string): Observable<ApiResponse<QuestionProgressDto[]>> {
    return this.http
      .get<ApiResponse<QuestionProgressDto[]>>(
        `${this.apiBase}/api/v1/exams/${attemptId}/progress`,
      )
      .pipe(
        tap((res) => {
          if (res.success && res.data) {
            this.progressItems.set(res.data);
          }
        }),
      );
  }

  markAnswered(attemptQuestionId: string) {
    this.progressItems.update((items) =>
      items.map((i) =>
        i.attemptQuestionId === attemptQuestionId
          ? { ...i, status: 'Answered' as const }
          : i,
      ),
    );
  }

  markUnanswered(attemptQuestionId: string) {
    this.progressItems.update((items) =>
      items.map((i) =>
        i.attemptQuestionId === attemptQuestionId
          ? { ...i, status: 'Unanswered' as const }
          : i,
      ),
    );
  }

  toggleFlag(attemptQuestionId: string): boolean {
    let newFlag = false;
    this.progressItems.update((items) =>
      items.map((i) => {
        if (i.attemptQuestionId === attemptQuestionId) {
          newFlag = !i.isFlagged;
          return { ...i, isFlagged: newFlag };
        }
        return i;
      }),
    );
    return newFlag;
  }

  isAnswered(attemptQuestionId: string): boolean {
    return this.progressMap().get(attemptQuestionId)?.status !== 'Unanswered';
  }

  getItem(attemptQuestionId: string): QuestionProgressDto | undefined {
    return this.progressMap().get(attemptQuestionId);
  }

  clear() {
    this.progressItems.set([]);
  }
}
