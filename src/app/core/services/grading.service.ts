import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-url.token';
import type { ApiResponse, PagedResult } from '../models/api-response.model';
import type { AttemptSummaryDto } from '../models/attempt.model';

export interface GradeSubmissionDto {
  questionGrades: {
    attemptQuestionId: string;
    score: number;
    feedback: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class GradingService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  getAttempts(examId: string, params?: { status?: string; page?: number; pageSize?: number }): Observable<ApiResponse<PagedResult<AttemptSummaryDto>>> {
    let queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize;
    if (params?.status) queryParams['status'] = params.status;
    return this.http.get<ApiResponse<PagedResult<AttemptSummaryDto>>>(`${this.apiBase}/api/v1/exams/${examId}/attempts`, { params: queryParams as any });
  }

  gradeAttempt(attemptId: string, grades: GradeSubmissionDto): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiBase}/api/v1/experts/grading/${attemptId}/grade`, grades);
  }

  getPendingGrading(params?: { page?: number; pageSize?: number }): Observable<ApiResponse<PagedResult<AttemptSummaryDto>>> {
    let queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize;
    return this.http.get<ApiResponse<PagedResult<AttemptSummaryDto>>>(`${this.apiBase}/api/v1/experts/grading/pending`, { params: queryParams as any });
  }
}
