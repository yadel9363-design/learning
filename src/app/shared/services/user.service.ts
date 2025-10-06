import { EnvironmentInjector, inject, Injectable, runInInjectionContext } from '@angular/core';
import { Database, ref, set, update, objectVal, get, getDatabase } from '@angular/fire/database';
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

  private runInCtx<T>(fn: () => T): T {
    return runInInjectionContext(this.envInjector, fn);
  }

  // ✅ حفظ بيانات المستخدم عند التسجيل أو تسجيل الدخول
  async save(user: any) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      providerId: user.providerData?.[0]?.providerId || user.providerId || 'unknown',
      isAdmin: user.isAdmin ?? false,
      phoneNumber: user.phoneNumber || '',
      gender: user.gender || ''
    };

    return this.runInCtx(async () => {
      const userRef = ref(this.db, `users/${user.uid}`);
      const snapshot = await get(userRef);

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
    });
  }

  // ✅ تحديث بيانات المستخدم (الصورة، الهاتف، الاسم... إلخ)
  async updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
    return this.runInCtx(async () => {
      const userRef = ref(this.db, `users/${uid}`);
      await update(userRef, data);
      console.log(`✅ User ${uid} updated with:`, data);
    });
  }

  // ✅ إرجاع بيانات المستخدم الحالية من الـ DB
  getCurrentUserData(): Observable<AppUser | null> {
    return this.userInContext().pipe(
      switchMap((u) => {
        if (!u) return of(null);
        return this.objectValInContext<AppUser>(`users/${u.uid}`).pipe(
          map(userProfile => {
            if (!userProfile) return null;
            return {
              ...userProfile,
              isAdmin: userProfile.isAdmin ?? false,
              phoneNumber: userProfile.phoneNumber ?? ''
            } as AppUser;
          })
        );
      })
    );
  }

  private userInContext(): Observable<User | null> {
    return new Observable<User | null>((subscriber) => {
      return this.runInCtx(() => user(this.auth).subscribe(subscriber));
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

  // ✅ تحديث المستخدمين القدامى (للمشرف فقط)
  async updateOldUsers() {
    return this.runInCtx(async () => {
      const currentUser = this.auth.currentUser;
      if (!currentUser) {
        console.warn('⚠️ No current user');
        return;
      }

      const adminRef = ref(this.db, `users/${currentUser.uid}`);
      const adminSnap = await get(adminRef);
      if (!adminSnap.exists() || adminSnap.val().isAdmin !== true) {
        console.warn('🚫 Access denied — user is not admin');
        return;
      }

      const db = getDatabase();
      const usersRef = ref(db, 'users');
      const snapshot = await get(usersRef);

      if (snapshot.exists()) {
        const users = snapshot.val();

        for (const uid in users) {
          const user = users[uid];
          const updates: any = {};

          if (user.phoneNumber === undefined) updates.phoneNumber = '';
          if (user.gender === undefined) updates.gender = '';

          if (Object.keys(updates).length > 0) {
            await update(ref(db, `users/${uid}`), updates);
            console.log(`✅ Updated user ${uid}`, updates);
          }
        }
      } else {
        console.log('No users found.');
      }
    });
  }

  // ✅ جلب مستخدم معين بالـ uid
  async getUserById(uid: string): Promise<AppUser | null> {
    return this.runInCtx(async () => {
      const userRef = ref(this.db, `users/${uid}`);
      const snapshot = await get(userRef);
      return snapshot.exists() ? (snapshot.val() as AppUser) : null;
    });
  }
}
