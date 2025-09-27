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

  // ✅ حفظ أو تحديث بيانات المستخدم
  async save(user: User) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      providerId: user.providerData[0]?.providerId || 'unknown',
      isAdmin: false
    };

    runInInjectionContext(this.envInjector, async () => {
      const userRef = ref(this.db, `users/${user.uid}`);

      try {
        const snapshot = await get(userRef);

        if (snapshot.exists()) {
          const existingData = snapshot.val();
          console.log("✅ User exists → updating data");

          await set(userRef, {
            ...existingData,
            ...userData,
            isAdmin: existingData.isAdmin ?? false
          });
        } else {
          console.log("🆕 New user → added to DB");
          await set(userRef, userData);
        }
      } catch (error) {
        console.error("❌ Error saving user:", error);
      }
    });
  }

  private objectValInContext<T>(path: string): Observable<T | null> {
    return runInInjectionContext(this.envInjector, () => {
      const userRef = ref(this.db, path);
      return objectVal<T>(userRef);
    });
  }

  private userInContext(): Observable<User | null> {
    return runInInjectionContext(this.envInjector, () => user(this.auth));
  }

  // ✅ بيانات المستخدم الحالي
  getCurrentUserData(): Observable<AppUser | null> {
    return this.userInContext().pipe(
      switchMap((u) => {
        console.log("Auth UID:", u?.uid);
        if (!u) return of(null);

        return this.objectValInContext<AppUser>(`users/${u.uid}`).pipe(
          map(userProfile => {
            console.log("User Profile from DB:", userProfile);
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

  // ✅ بيانات مستخدم بالـ UID
  getUserProfile(uid: string): Observable<AppUser | null> {
    return this.objectValInContext<AppUser>(`users/${uid}`);
  }
}
