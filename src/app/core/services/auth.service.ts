import { computed, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import type { ApiResponse } from '../models/api-response.model';
import type { ForgotPasswordRequestDto, LoginRequestDto, LoginResponseDto, RefreshTokenRequestDto, RegisterRequestDto, RegisterResponseDto } from '../models/auth.model';
import { API_BASE_URL } from '../tokens/api-url.token';

const ACCESS_TOKEN_KEY = 'proexam_access_token';
const REFRESH_TOKEN_KEY = 'proexam_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = inject(API_BASE_URL);

  private readonly accessToken = signal<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  private readonly refreshToken = signal<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
  readonly currentUser = signal<LoginResponseDto['user'] | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken());

  private readonly authApi = `${this.apiBase}/api/v1/auth`;

  constructor() {
    if (this.accessToken()) {
      this.loadUserFromToken();
    }
  }

  login(payload: LoginRequestDto) {
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.authApi}/login`, payload);
  }

  register(payload: RegisterRequestDto) {
    return this.http.post<ApiResponse<RegisterResponseDto>>(`${this.authApi}/register`, payload);
  }

  refresh() {
    const token = this.refreshToken();
    if (!token) {
      this.logout();
      return throwError(() => new Error('No refresh token available'));
    }
    const payload: RefreshTokenRequestDto = { refreshToken: token };
    return this.http.post<ApiResponse<LoginResponseDto>>(`${this.authApi}/refresh`, payload);
  }

  forgotPassword(payload: ForgotPasswordRequestDto) {
    return this.http.post<ApiResponse<null>>(`${this.authApi}/forgot-password`, payload);
  }

  logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.accessToken.set(null);
    this.refreshToken.set(null);
    this.currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
  }

  getAccessToken() {
    return this.accessToken();
  }

  getRefreshToken() {
    return this.refreshToken();
  }

  syncFromStorage(): boolean {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (stored && !this.accessToken()) {
      this.accessToken.set(stored);
      const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (storedRefresh) this.refreshToken.set(storedRefresh);
    }
    const hasToken = !!this.accessToken();
    if (hasToken && !this.currentUser()) {
      this.loadUserFromToken();
    }
    return hasToken;
  }

  restoreUserFromToken(): boolean {
    const token = this.accessToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser.set({
        userId: payload.sub || payload.userId || '',
        email: payload.email || '',
        firstName: payload.given_name || payload.name || '',
        role: payload.role || 'candidate',
      });
      return true;
    } catch {
      return false;
    }
  }

  private loadUserFromToken() {
    const token = this.accessToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      this.currentUser.set({
        userId: payload.sub || payload.userId || '',
        email: payload.email || '',
        firstName: payload.given_name || payload.name || '',
        role: payload.role || 'candidate',
      });
    } catch {
      this.logout();
    }
  }
}
