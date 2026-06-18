import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-url.token';
import type { ApiResponse } from '../models/api-response.model';
import type { TopicDto, CreateQuestionDto } from '../models/exam.model';

export interface CreateTopicDto {
  name: string;
  description: string;
}

export interface UpdateTopicDto {
  name: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class TopicService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  getByTestBank(testBankId: string): Observable<ApiResponse<TopicDto[]>> {
    return this.http.get<ApiResponse<TopicDto[]>>(`${this.apiBase}/api/v1/test-banks/${testBankId}/topics`);
  }

  getById(testBankId: string, topicId: string): Observable<ApiResponse<TopicDto>> {
    return this.http.get<ApiResponse<TopicDto>>(`${this.apiBase}/api/v1/test-banks/${testBankId}/topics/${topicId}`);
  }

  create(testBankId: string, dto: CreateTopicDto): Observable<ApiResponse<TopicDto>> {
    return this.http.post<ApiResponse<TopicDto>>(`${this.apiBase}/api/v1/test-banks/${testBankId}/topics`, dto);
  }

  update(testBankId: string, topicId: string, dto: UpdateTopicDto): Observable<ApiResponse<TopicDto>> {
    return this.http.put<ApiResponse<TopicDto>>(`${this.apiBase}/api/v1/test-banks/${testBankId}/topics/${topicId}`, dto);
  }

  delete(testBankId: string, topicId: string): Observable<HttpResponse<void>> {
    return this.http.delete<HttpResponse<void>>(`${this.apiBase}/api/v1/test-banks/${testBankId}/topics/${topicId}`, { observe: 'response' as const }) as unknown as Observable<HttpResponse<void>>;
  }

  toggleActive(topicId: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiBase}/api/v1/admin/topics/${topicId}/toggle`, {});
  }
}
