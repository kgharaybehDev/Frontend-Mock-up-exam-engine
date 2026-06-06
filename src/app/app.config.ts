import { APP_INITIALIZER, ApplicationConfig, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { API_BASE_URL } from './core/tokens/api-url.token';
import { AuthService } from './core/services/auth.service';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor, errorInterceptor, loadingInterceptor]),
    ),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => {
        console.log(`[Auth Debug] [${new Date().toISOString()}] APP_INITIALIZER - starting syncFromStorage`);
        const result = auth.syncFromStorage();
        console.log(`[Auth Debug] [${new Date().toISOString()}] APP_INITIALIZER - completed, hasToken: ${result}`);
      },
      deps: [AuthService],
      multi: true,
    },
  ],
};
