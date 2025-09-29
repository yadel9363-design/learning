import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Database, ref, set, objectVal, get } from '@angular/fire/database';
import { User } from 'firebase/auth';
import { Auth, user } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AppUser } from '../DTO/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private db = inject(Database);
  private envInjector = inject(EnvironmentInjector);
  private auth: Auth = inject(Auth);

  /** ✅ helper عام */
  private runInCtx<T>(fn: () => T): T {
    return runInInjectionContext(this.envInjector, fn);
  }

  async save(user: User) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      providerId: user.providerData[0]?.providerId || 'unknown',
      isAdmin: false
    };

    return this.runInCtx(async () => {
      const userRef = ref(this.db, `users/${user.uid}`);
      try {
        const snapshot = await get(userRef); // ✅ دلوقتي جوه Context

        if (snapshot.exists()) {
          const existingData = snapshot.val();
          await set(userRef, {
            ...existingData,
            ...userData,
            isAdmin: existingData.isAdmin ?? false
          });
        } else {
          await set(userRef, userData);
        }
      } catch (error) {
        console.error("❌ Error saving user:", error);
      }
    });
  }

private objectValInContext<T>(path: string): Observable<T | null> {
  return new Observable<T | null>((subscriber) => {
    return this.runInCtx(() => {
      const userRef = ref(this.db, path);
      return objectVal<T>(userRef).subscribe(subscriber);
    });
  });
}


private userInContext(): Observable<User | null> {
  return new Observable<User | null>((subscriber) => {
    return this.runInCtx(() => user(this.auth).subscribe(subscriber));
  });
}

  getCurrentUserData(): Observable<AppUser | null> {
    return this.userInContext().pipe(
      switchMap((u) => {
        if (!u) return of(null);

        return this.objectValInContext<AppUser>(`users/${u.uid}`).pipe(
          map(userProfile => {
            if (!userProfile) return null;
            return {
              ...userProfile,
              isAdmin: userProfile.isAdmin ?? false
            } as AppUser;
          })
        );
      })
    );
  }

  getUserProfile(uid: string): Observable<AppUser | null> {
    return this.objectValInContext<AppUser>(`users/${uid}`);
  }
}
