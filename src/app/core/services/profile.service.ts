import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { ApiResponse } from '../models/api-response.model';
import type { CandidateDto, UpdateCandidateDto } from '../models/user.model';
import { API_BASE_URL } from '../tokens/api-url.token';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly apiBase = inject(API_BASE_URL);

  getProfile() {
    return this.http.get<ApiResponse<CandidateDto>>(`${this.apiBase}/api/v1/candidates/me`);
  }

  updateProfile(dto: UpdateCandidateDto) {
    return this.http.put<ApiResponse<CandidateDto>>(`${this.apiBase}/api/v1/candidates/me`, dto);
  }
}
