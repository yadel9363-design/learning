// src/app/shared/DTO/firebase.config.ts
import { provideFirebaseApp } from '@angular/fire/app';
import { initializeApp, getApps, getApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: "AIzaSyA-s-3Cd-XbOb9B5ehDeH3_HjZSj0AnHFU",
  authDomain: "learning-823.firebaseapp.com",
  projectId: "learning-823",
  storageBucket: "learning-823.appspot.com",
  messagingSenderId: "586497491028",
  appId: "1:586497491028:web:b1d175afa1a661585aadc1",
  measurementId: "G-4BKENBTF5P",
  databaseURL: "https://learning-823-default-rtdb.firebaseio.com" // أضف هذا السطر
};

// ✅ هذا هو الشكل الصحيح لـ firebaseProviders
export const firebaseProviders = [
  provideFirebaseApp(() => {
    if (!getApps().length) {
      return initializeApp(firebaseConfig);
    }
    return getApp();
  })
];
