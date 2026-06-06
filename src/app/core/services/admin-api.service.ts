import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../tokens/api-url.token';
import type { ApiResponse, PagedResult } from '../models/api-response.model';
import type {
  TestBankListItemDto,
  TopicListItemDto,
  CreateTestBankDto,
  CreateTopicDto,
  AdminCreateQuestionDto,
  AdminQuestionListItemDto,
  AdminQuestionDetailDto,
} from '../models/admin.model';

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);
  private readonly adminBase = `${this.apiBase}/api/v1/admin`;

  getTestBanks() {
    return this.http.get<ApiResponse<PagedResult<TestBankListItemDto>>>(`${this.adminBase}/testbanks`);
  }

  createTestBank(dto: CreateTestBankDto) {
    return this.http.post<ApiResponse<TestBankListItemDto>>(`${this.adminBase}/testbanks`, dto);
  }

  toggleTestBank(id: string) {
    return this.http.patch<ApiResponse<unknown>>(`${this.adminBase}/testbanks/${id}/toggle`, {});
  }

  getTopics(testBankId: string) {
    return this.http.get<ApiResponse<PagedResult<TopicListItemDto>>>(`${this.adminBase}/testbanks/${testBankId}/topics`);
  }

  createTopic(dto: CreateTopicDto) {
    return this.http.post<ApiResponse<TopicListItemDto>>(`${this.adminBase}/topics`, dto);
  }

  updateTopic(id: string, dto: Partial<CreateTopicDto>) {
    return this.http.put<ApiResponse<TopicListItemDto>>(`${this.adminBase}/topics/${id}`, dto);
  }

  toggleTopic(id: string) {
    return this.http.patch<ApiResponse<unknown>>(`${this.adminBase}/topics/${id}/toggle`, {});
  }

  getQuestions(topicId: string, page = 1, pageSize = 20) {
    return this.http.get<ApiResponse<PagedResult<AdminQuestionListItemDto>>>(
      `${this.adminBase}/questions/by-topic/${topicId}?page=${page}&pageSize=${pageSize}`
    );
  }

  getQuestionDetail(id: string) {
    return this.http.get<ApiResponse<AdminQuestionDetailDto>>(`${this.adminBase}/questions/${id}`);
  }

  createQuestion(dto: AdminCreateQuestionDto) {
    return this.http.post<ApiResponse<AdminQuestionDetailDto>>(`${this.adminBase}/questions`, dto);
  }

  updateQuestion(id: string, dto: Partial<AdminCreateQuestionDto>) {
    return this.http.put<ApiResponse<AdminQuestionDetailDto>>(`${this.adminBase}/questions/${id}`, dto);
  }

  toggleQuestion(id: string) {
    return this.http.patch<ApiResponse<unknown>>(`${this.adminBase}/questions/${id}/toggle`, {});
  }
}
