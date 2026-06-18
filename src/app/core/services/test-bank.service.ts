import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api-url.token';
import type { ApiResponse, PagedResult } from '../models/api-response.model';
import type { TestBankDto } from '../models/exam.model';

export interface CreateTestBankDto {
  name: string;
  country: string;
  certificationType: string;
  description: string;
}

export interface UpdateTestBankDto {
  name: string;
  country: string;
  certificationType: string;
  description: string;
}

@Injectable({ providedIn: 'root' })
export class TestBankService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  private readonly testBanksBase = `${this.apiBase}/api/v1/test-banks`;

  getAll(params?: { country?: string; certificationType?: string; page?: number; pageSize?: number }): Observable<ApiResponse<PagedResult<TestBankDto>>> {
    let queryParams: Record<string, string | number> = {};
    if (params?.page) queryParams['page'] = params.page;
    if (params?.pageSize) queryParams['pageSize'] = params.pageSize;
    if (params?.country) queryParams['country'] = params.country;
    if (params?.certificationType) queryParams['certificationType'] = params.certificationType;
    return this.http.get<ApiResponse<PagedResult<TestBankDto>>>(`${this.testBanksBase}`, { params: queryParams as any });
  }

  getById(testBankId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.testBanksBase}/${testBankId}`);
  }

  create(dto: CreateTestBankDto): Observable<ApiResponse<TestBankDto>> {
    return this.http.post<ApiResponse<TestBankDto>>(`${this.testBanksBase}`, dto);
  }

  update(testBankId: string, dto: UpdateTestBankDto): Observable<ApiResponse<TestBankDto>> {
    return this.http.put<ApiResponse<TestBankDto>>(`${this.testBanksBase}/${testBankId}`, dto);
  }

  delete(testBankId: string): Observable<HttpResponse<void>> {
    return this.http.delete<HttpResponse<void>>(`${this.testBanksBase}/${testBankId}`, { observe: 'response' as const }) as unknown as Observable<HttpResponse<void>>;
  }

  toggleActive(testBankId: string): Observable<ApiResponse<any>> {
    return this.http.patch<ApiResponse<any>>(`${this.apiBase}/api/v1/admin/testbanks/${testBankId}/toggle`, {});
  }
}
