// src/main.ts
// import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'; // No longer needed
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog'; // No need for DynamicDialogModule here
import { AngularFireModule } from '@angular/fire/compat';
import { firebaseConfig } from './app/environment';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async'; // Use async
import { AppRoutingModule } from './app/app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app/app.component';
import { importProvidersFrom } from '@angular/core';

// Import PrimeNG config and theme preset
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura'; // Import the theme preset


bootstrapApplication(AppComponent, {
    providers: [
        // Import necessary Angular modules and Routing
        importProvidersFrom(
            BrowserModule,
            AppRoutingModule,
            FormsModule,
            ReactiveFormsModule,
            AngularFireModule.initializeApp(firebaseConfig),
            AngularFireAuthModule
            // PrimeNG modules removed - handled by providePrimeNG or component imports
        ),
        // Provide HttpClient
        provideHttpClient(withInterceptorsFromDi()),
        // Provide Browser Animations
        provideAnimationsAsync(), // Use async version
        // Provide PrimeNG configuration
        providePrimeNG({
            theme: {
                preset: Aura,
                // Optional: Add specific theme options if needed
            },
            ripple: true // Optional: enable ripple effect globally
        }),
        // Provide PrimeNG Services
        ConfirmationService,
        MessageService,
        DialogService,
    ]
})
  .catch(err => console.error(err));
