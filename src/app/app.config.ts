import { ApplicationConfig, inject, PLATFORM_ID, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { firebaseProviders } from './shared/DTO/firebase.config';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { providePerformance, getPerformance } from '@angular/fire/performance';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { isPlatformBrowser } from '@angular/common';
import { MessageService } from 'primeng/api';
import { provideFunctions, getFunctions } from '@angular/fire/functions';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),

    // ✅ استخدم importProvidersFrom مع BrowserAnimationsModule بدل provideAnimations()
    importProvidersFrom(BrowserAnimationsModule),

    provideRouter(routes),
    // provideClientHydration(),
    providePrimeNG({ theme: { preset: Aura } }),
    provideZoneChangeDetection({ eventCoalescing: true }),

    // Firebase
    ...firebaseProviders,
    provideAuth(() => getAuth()),
    provideFunctions(() => getFunctions()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    providePerformance(() => {
      const platformId = inject(PLATFORM_ID);
      if (isPlatformBrowser(platformId)) {
        return getPerformance();
      } else {
        return {} as any;
      }
    }),

    MessageService
  ],
};
