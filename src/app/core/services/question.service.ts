import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-url.token';
import type { ApiResponse, PagedResult } from '../models/api-response.model';
import type { QuestionDto, CreateQuestionDto } from '../models/exam.model';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  private readonly questionsBase = `${this.apiBase}/api/v1/questions`;

  getByTopic(topicId: string, params?: { difficulty?: number; page?: number; pageSize?: number; includeInactive?: boolean }): Observable<ApiResponse<PagedResult<QuestionDto>>> {
    let queryParams: Record<string, string | number | boolean> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize;
    if (params?.difficulty) queryParams['difficulty'] = params.difficulty;
    if (params?.includeInactive) queryParams['includeInactive'] = params.includeInactive;
    return this.http.get<ApiResponse<PagedResult<QuestionDto>>>(`${this.apiBase}/api/v1/topics/${topicId}/questions`, { params: queryParams as any });
  }

  getById(questionId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.questionsBase}/${questionId}`);
  }

  create(topicId: string, dto: CreateQuestionDto): Observable<ApiResponse<QuestionDto>> {
    return this.http.post<ApiResponse<QuestionDto>>(`${this.apiBase}/api/v1/topics/${topicId}/questions`, dto);
  }

  update(questionId: string, dto: Partial<CreateQuestionDto>): Observable<ApiResponse<QuestionDto>> {
    return this.http.put<ApiResponse<QuestionDto>>(`${this.questionsBase}/${questionId}`, dto);
  }

  delete(questionId: string): Observable<HttpResponse<void>> {
    return this.http.delete<HttpResponse<void>>(`${this.questionsBase}/${questionId}`, { observe: 'response' as const }) as unknown as Observable<HttpResponse<void>>;
  }

  toggleActive(questionId: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiBase}/api/v1/admin/questions/${questionId}/toggle`, {});
  }

  addAttachment(questionId: string, dto: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.questionsBase}/${questionId}/attachments`, dto);
  }

  removeAttachment(questionId: string, attachmentId: string): Observable<HttpResponse<void>> {
    return this.http.delete<HttpResponse<void>>(`${this.questionsBase}/${questionId}/attachments/${attachmentId}`, { observe: 'response' as const }) as unknown as Observable<HttpResponse<void>>;
  }
}
