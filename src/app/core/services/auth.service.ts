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

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp) {
      return payload.exp * 1000 < Date.now();
    }
    return false;
  } catch {
    return true;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiBase = inject(API_BASE_URL);

  private readonly accessToken = signal<string | null>(null);
  private readonly refreshToken = signal<string | null>(null);
  readonly currentUser = signal<LoginResponseDto['user'] | null>(null);
  readonly isAuthenticated = computed(() => !!this.accessToken());

  private readonly authApi = `${this.apiBase}/api/v1/auth`;

  constructor() {
    this.syncFromStorage();
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

  private decodeToken() {
    const token = this.accessToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload.sub || payload.userId || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || '';
      const email = payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '';
      const firstName = payload.given_name || payload.name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname'] || '';
      const rawRole = payload.role || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'candidate';
      const role = rawRole === 'Admin' ? 'Admin' : rawRole === 'Expert' ? 'Expert' : 'candidate';
      this.currentUser.set({ userId, email, firstName, role });
    } catch {
      this.currentUser.set(null);
    }
  }

  setTokens(access: string, refresh: string) {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
    this.accessToken.set(access);
    this.refreshToken.set(refresh);
  }

  getAccessToken(): string | null {
    const fromSignal = this.accessToken();
    if (fromSignal) return fromSignal;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    const fromSignal = this.refreshToken();
    if (fromSignal) return fromSignal;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  syncFromStorage(): boolean {
    const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (stored) {
      this.accessToken.set(stored);
      if (storedRefresh) this.refreshToken.set(storedRefresh);
    }
    if (stored && !this.currentUser()) {
      this.decodeToken();
    }
    return !!stored;
  }
}
