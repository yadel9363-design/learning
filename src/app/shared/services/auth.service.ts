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
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { setPersistence, inMemoryPersistence } from '@angular/fire/auth';

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
      this.initAuthListener();
    }
    if (isPlatformBrowser(this.platformId)) {
    // 🧠 منع Firebase من تخزين المستخدم في session/local storage
    setPersistence(this.auth, inMemoryPersistence)
      .then(() => {
        console.log('✅ Firebase persistence set to in-memory (no storage)');
        this.initAuthListener();
      })
      .catch((err) => console.error('❌ Failed to set persistence', err));
  }
  }

  /** ✅ تهيئة authState */
  private initAuthListener() {
    authState(this.auth).subscribe(async (user) => {
      this.zone.run(async () => {
        if (user) {
          await this.loadUserData(user.uid, user);
        } else {
          this.currentUserSubject.next(null);
        }
      });
    });
  }

  /** ✅ تحميل بيانات المستخدم من قاعدة البيانات */
  private async loadUserData(uid: string, fallbackUser?: User | null) {
    try {
      const dbUser = await this.userService.getUserById(uid);
      if (dbUser) {
        const mergedUser = { ...(fallbackUser || {}), ...dbUser };
        this.setUser(mergedUser as User);
      } else if (fallbackUser) {
        this.setUser(fallbackUser);
      }
    } catch (error) {
      console.error('❌ Failed to load user data:', error);
      if (fallbackUser) this.setUser(fallbackUser);
    }
  }

  /** ✅ تحديث المستخدم في الذاكرة فقط (بدون أي تخزين محلي) */
  public setUser(user: User | null) {
    this.currentUserSubject.next(user);
  }

  // ✅ إنشاء حساب جديد
  async registerWithEmail(email: string, password: string, displayName?: string, phoneNumber?: string, gender?: string) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    if (displayName) await updateProfile(cred.user, { displayName });

    const refreshedUser = this.auth.currentUser;
    if (!refreshedUser) throw new Error('User not found after registration.');

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

    await this.userService.save(newUserData);
    const dbUser = await this.userService.getUserById(refreshedUser.uid);

    this.setUser({ ...refreshedUser, ...(dbUser || {}) } as User);
    return { ...refreshedUser, ...(dbUser || {}) };
  }

  // ✅ تسجيل الدخول بالبريد
  async loginWithEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    await this.loadUserData(cred.user.uid, cred.user);
    return this.currentUserSubject.value;
  }

  // ✅ تسجيل الدخول بجوجل
  async loginWithGoogle() {
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const user = result.user;
    await this.userService.save(user);
    await this.loadUserData(user.uid, user);

    this.zone.run(() => this.router.navigate(['/home']));
    return user;
  }

  // ✅ تسجيل الخروج
  async logout() {
    this.currentUserSubject.next(null);
    await signOut(this.auth);
    this.zone.run(() => this.router.navigate(['/login']));
  }

  // ✅ التحقق من تسجيل الدخول
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  // ✅ تحديث بيانات المستخدم
  async refreshUserData() {
    const user = this.currentUserSubject.value;
    if (!user) return;
    await this.loadUserData(user.uid, user);
  }
}
