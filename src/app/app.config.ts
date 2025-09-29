// src/app/app.config.ts
import { ApplicationConfig, provideZoneChangeDetection, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { firebaseProviders } from './shared/DTO/firebase.config';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; // ✅ Firestore
import { environment } from '../environments/environment';
import { provideServerRendering } from '@angular/ssr';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';


export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideRouter(routes),
    provideClientHydration(),
    providePrimeNG({ theme: { preset: Aura } }),
  provideZoneChangeDetection({ eventCoalescing: true }),
    // ✅ Firebase init
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()), // ✅ مهم جداً

    providePerformance(() => {
      const platformId = inject(PLATFORM_ID);
      if (isPlatformBrowser(platformId)) {
        return getPerformance();
      } else {
        return {} as any;
      }
    }),

    ...firebaseProviders,
  ],
};
