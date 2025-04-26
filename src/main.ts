import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { importProvidersFrom } from '@angular/core';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { firebaseConfig } from './app/environment';
import { ConfirmationService, MessageService } from 'primeng/api';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/auth/auth.interceptor';

// Add Firebase and PrimeNG services to the providers
const updatedConfig = {
  providers: [
    ...appConfig.providers,
    importProvidersFrom(
      AngularFireModule.initializeApp(firebaseConfig),
      AngularFireAuthModule
    ),
    // Provide PrimeNG Services
    ConfirmationService,
    MessageService,
    // Add HTTP interceptor
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  ],
};

bootstrapApplication(AppComponent, updatedConfig).catch((err) =>
  console.error(err)
);
