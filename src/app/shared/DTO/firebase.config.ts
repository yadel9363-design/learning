import { provideFirebaseApp, initializeApp, getApps, getApp } from '@angular/fire/app';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { environment } from '../../../environments/environment';

export const firebaseProviders = [
  provideFirebaseApp(() => {
    if (getApps().length === 0) {
      return initializeApp(environment.firebaseConfig);
    }
    return getApp();
  }),
  provideDatabase(() => getDatabase()),
  provideAuth(() => getAuth()),
  provideStorage(() => getStorage())
];
