import { EnvironmentInjector, inject, Injectable, runInInjectionContext, isDevMode } from '@angular/core';
import { Database, ref, set, update, objectVal, get } from '@angular/fire/database';
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

  constructor() {
    this.log('✅ UserService initialized');
  }

  private runInCtx<T>(fn: () => T): T {
    return runInInjectionContext(this.envInjector, fn);
  }

  private log(...args: any[]) {
    if (isDevMode()) {
    }
  }

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

  // ✅ ضع كل شيء داخل runInCtx
  return this.runInCtx(async () => {
    const userRef = ref(this.db, `users/${user.uid}`);
    const snapshot = await get(userRef); // ⚡ لن يسبب التحذير الآن

    if (snapshot.exists()) {
      const existingData = snapshot.val();
      await set(userRef, {
        ...existingData,
        ...userData,
        isAdmin: existingData.isAdmin ?? false
      });
      this.log(`🔄 Updated existing user: ${user.uid}`);
    } else {
      await set(userRef, userData);
      this.log(`🆕 Created new user: ${user.uid}`);
    }
  });
}


  /** ✅ تحديث بيانات المستخدم */
  async updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
    return this.runInCtx(async () => {
      const userRef = ref(this.db, `users/${uid}`);
      await update(userRef, data);
      this.log(`✅ User ${uid} updated with:`, data);
    });
  }

  /** ✅ بيانات المستخدم الحالي */
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

  /** ✅ مراقبة المستخدم داخل Context */
  private userInContext(): Observable<User | null> {
    return new Observable<User | null>((subscriber) => {
      return this.runInCtx(() => user(this.auth).subscribe(subscriber));
    });
  }

  /** ✅ قراءة Object داخل Context */
  private objectValInContext<T>(path: string): Observable<T | null> {
    return new Observable<T | null>((subscriber) => {
      return this.runInCtx(() => {
        const userRef = ref(this.db, path);
        return objectVal<T>(userRef).subscribe(subscriber);
      });
    });
  }

  /** ✅ تحديث المستخدمين القدامى (للمشرف فقط) */
async updateOldUsers() {
  // ✅ لفّ كل الكود بـ runInCtx
  return this.runInCtx(async () => {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      this.log('⚠️ No current user');
      return;
    }

    const adminSnap = await get(ref(this.db, `users/${currentUser.uid}`));
    if (!adminSnap.exists() || adminSnap.val().isAdmin !== true) {
      this.log('🚫 Access denied — user is not admin');
      return;
    }

    const snapshot = await get(ref(this.db, 'users'));
    if (!snapshot.exists()) {
      this.log('ℹ️ No users found.');
      return;
    }

    const users = snapshot.val();
    for (const uid in users) {
      const user = users[uid];
      const updates: any = {};

      if (user.phoneNumber === undefined) updates.phoneNumber = '';
      if (user.gender === undefined) updates.gender = '';

      if (Object.keys(updates).length > 0) {
        await update(ref(this.db, `users/${uid}`), updates);
        this.log(`✅ Updated user ${uid}`, updates);
      }
    }
  });
}


  /** ✅ جلب مستخدم بالـ uid */
async getUserById(uid: string): Promise<AppUser | null> {
  // ✅ هنا كمان نلفّ كل الـ async بـ runInCtx
  return this.runInCtx(async () => {
    const userRef = ref(this.db, `users/${uid}`);
    const snapshot = await get(userRef);
    return snapshot.exists() ? (snapshot.val() as AppUser) : null;
  });
}

}
