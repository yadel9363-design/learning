import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  authState,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from '@angular/fire/auth';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './user.service';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(
    private auth: Auth,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      // ✅ المراقبة لحالة المستخدم فقط داخل المتصفح
authState(this.auth).subscribe(async (user) => {
  this.zone.run(async () => {
    if (user) {
      // ✅ احصل على البيانات من قاعدة البيانات
      const dbUser = await this.userService.getUserById(user.uid);
      const mergedUser = { ...user, ...(dbUser || {}) };

      // ✅ خزّن المستخدم بالبيانات الكاملة
      this.currentUserSubject.next(mergedUser as any);
      localStorage.setItem('user', JSON.stringify(mergedUser));

      // ✅ حفظ في قاعدة البيانات إذا ما كانش موجود
      if (!dbUser) {
        await this.userService.save(mergedUser);
      }
    } else {
      this.currentUserSubject.next(null);
      localStorage.removeItem('user');
    }
  });
});


      // ✅ تحميل المستخدم من التخزين المحلي
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  // ✅ تأمين استخدام localStorage في كل دالة
  private setLocalUser(user: User | null) {
    if (isPlatformBrowser(this.platformId)) {
      if (user) localStorage.setItem('user', JSON.stringify(user));
      else localStorage.removeItem('user');
    }
  }

  setUser(user: User) {
    this.currentUserSubject.next(user);
    this.setLocalUser(user);
  }

  // ✅ إنشاء حساب جديد (يدعم phoneNumber و gender)
async registerWithEmail(
  email: string,
  password: string,
  displayName?: string,
  phoneNumber?: string,
  gender?: string
) {
  // إنشاء الحساب
  const cred = await createUserWithEmailAndPassword(this.auth, email, password);

  // تحديث الاسم في حساب Firebase Auth
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }

  // تحديث المستخدم من Firebase
  await cred.user.reload();
  const refreshedUser = this.auth.currentUser;
  if (!refreshedUser) throw new Error('User not found after registration.');

  // ✅ بناء object يدوي بدون نسخ من كائن Firebase
  const newUserData = {
    uid: refreshedUser.uid,
    email: refreshedUser.email,
    displayName: refreshedUser.displayName || '',
    photoURL: refreshedUser.photoURL || '',
    providerId: refreshedUser.providerData?.[0]?.providerId || 'password',
    phoneNumber: phoneNumber || '',
    gender: gender || '',
    isAdmin: false,
  };

  // ✅ حفظ في قاعدة البيانات
  await this.userService.save(newUserData);
  console.log('✅ User saved with phone and gender:', newUserData);

  // ✅ جلب النسخة الكاملة من قاعدة البيانات
  const dbUser = await this.userService.getUserById(refreshedUser.uid);

  // ✅ تحديث المستخدم الحالي في الذاكرة والمحلي
  this.setUser({
    ...refreshedUser,
    ...(dbUser || {}),
  } as User);

  return {
    ...refreshedUser,
    ...(dbUser || {}),
  };
}




  // ✅ تسجيل الدخول بالبريد وكلمة السر
async loginWithEmail(email: string, password: string) {
  const cred = await signInWithEmailAndPassword(this.auth, email, password);

  // ✅ اجلب بيانات المستخدم من قاعدة البيانات
  const dbUser = await this.userService.getUserById(cred.user.uid);

  // ✅ دمج بيانات Firebase مع بيانات قاعدة البيانات
  const mergedUser = {
    ...cred.user,
    ...(dbUser || {}),
  } as User;

  // ✅ تحديث المستخدم في الذاكرة والمحلي
  this.setUser(mergedUser);

  // ✅ لا تحفظ مباشرة بيانات Firebase حتى لا تكتب على phoneNumber / gender الفارغين
  if (!dbUser) {
    await this.userService.save(mergedUser);
  }

  return mergedUser;
}


  // ✅ تسجيل الدخول بجوجل
  async loginWithGoogle() {
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const user = result.user;

    this.setUser(user);
    await this.userService.save(user);

    // ✅ التوجيه بعد تسجيل الدخول
    this.zone.run(() => this.router.navigate(['/home']));
    return user;
  }

  // ✅ تسجيل الخروج
  async logout() {
    this.currentUserSubject.next(null);
    this.setLocalUser(null);
    await signOut(this.auth);
    this.zone.run(() => this.router.navigate(['/login']));
  }

  // ✅ هل المستخدم مسجل دخول؟
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
  // ✅ تحديث بيانات المستخدم الحالية من قاعدة البيانات
async refreshUserData() {
  const user = this.currentUserSubject.value;
  if (!user) return;

  const dbUser = await this.userService.getUserById(user.uid);
  if (!dbUser) return;

  const updatedUser = { ...user, ...dbUser };
  this.setUser(updatedUser as any);

  console.log('🔄 User data refreshed:', updatedUser);
}

}
