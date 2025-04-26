import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideHttpClient,
  withInterceptorsFromDi,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';
import { AuthInterceptor } from './auth/auth.interceptor';

// Import PrimeNG theme presets
import Aura from '@primeng/themes/aura';
import Lara from '@primeng/themes/lara';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          prefix: 'p',
          darkModeSelector: '.dark-theme',
          cssLayer: false,
        },
      },
      ripple: true,
    }),
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};
