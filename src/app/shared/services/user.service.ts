import {
  EnvironmentInjector,
  inject,
  Injectable,
  runInInjectionContext,
  isDevMode,
} from '@angular/core';
import { Database, ref, set, update, objectVal, get } from '@angular/fire/database';
import { User } from 'firebase/auth';
import { Auth, user } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import { AppUser } from '../DTO/user.model';
import { httpsCallable, Functions } from '@angular/fire/functions';


@Injectable({ providedIn: 'root' })
export class UserService {
  private db = inject(Database);
  private envInjector = inject(EnvironmentInjector);
  private auth: Auth = inject(Auth);
 private functions = inject(Functions);
  private runInCtx<T>(fn: () => T): T {
    return runInInjectionContext(this.envInjector, fn);
  }

  private log(...args: any[]) {
    if (isDevMode()) console.log(...args);
  }

  /** ✅ إنشاء أو تحديث المستخدم */
  async save(user: any) {
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      providerId: user.providerData?.[0]?.providerId || user.providerId || 'unknown',
      isAdmin: user.isAdmin ?? false,
      phoneNumber: user.phoneNumber || '',
      gender: user.gender || '',
      interests: user.interests || [], // ✅ حفظ الاهتمامات
    };

    return this.runInCtx(async () => {
      const userRef = ref(this.db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const existingData = snapshot.val();
        await set(userRef, {
          ...existingData,
          ...userData,
          isAdmin: existingData.isAdmin ?? false,
        });
        this.log(`🔄 Updated existing user: ${user.uid}`);
      } else {
        await set(userRef, userData);
        this.log(`🆕 Created new user: ${user.uid}`);
      }
    });
  }

  async updateUser(uid: string, data: Partial<AppUser>): Promise<void> {
    return this.runInCtx(async () => {
      const userRef = ref(this.db, `users/${uid}`);
      await update(userRef, data);
      this.log(`✅ User ${uid} updated with:`, data);
    });
  }

  getCurrentUserData(): Observable<AppUser | null> {
    return this.userInContext().pipe(
      switchMap((u) => {
        if (!u) return of(null);
        return this.objectValInContext<AppUser>(`users/${u.uid}`).pipe(
          map((userProfile) => {
            if (!userProfile) return null;
            return {
              ...userProfile,
              isAdmin: userProfile.isAdmin ?? false,
              phoneNumber: userProfile.phoneNumber ?? '',
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

  async getUserById(uid: string): Promise<AppUser | null> {
    return this.runInCtx(async () => {
      const userRef = ref(this.db, `users/${uid}`);
      const snapshot = await get(userRef);
      return snapshot.exists() ? (snapshot.val() as AppUser) : null;
    });
  }
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

async getUserByEmail(email: string): Promise<AppUser | null> {
  return this.runInCtx(async () => {
    const usersRef = ref(this.db, 'users');
    const snapshot = await get(usersRef);
    if (!snapshot.exists()) {
      // ✅ قاعدة البيانات فاضية
      return null;
    }

    const users = snapshot.val();

    // ✅ التأكد إن كل user عنده email قبل المقارنة
    const user = Object.values(users).find(
      (u: any) => u.email && u.email.toLowerCase() === email.toLowerCase()
    ) as AppUser | undefined;

    // ✅ لو مفيش مستخدم فعلاً
    return user ?? null;
  });
}
  async getUserCount() {
    // ⬇️ هنا عرف شكل الداتا اللي الفنكشن هترجعه
    const callable = httpsCallable<unknown, { totalUsers: number }>(
      this.functions,
      'getUserCount'
    );

    const result = await callable({});
    console.log('👥 Total users:', result.data.totalUsers);
    return result.data.totalUsers;
  }

}
