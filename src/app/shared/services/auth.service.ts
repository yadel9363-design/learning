import {
  Injectable,
  NgZone,
  Inject,
  PLATFORM_ID,
  EnvironmentInjector,
  inject,
  runInInjectionContext,
} from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  authState,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { setPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { Database } from '@angular/fire/database';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.currentUserSubject.asObservable();
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);
  private user$Initialized = false;
  private db: Database = inject(Database);

  constructor(
    private auth: Auth,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private router: Router
  ) {
    if (isPlatformBrowser(this.platformId)) {
      setPersistence(this.auth, browserSessionPersistence)
        .then(() => this.initAuthListener())
        .catch((err) => console.error('❌ Failed to set persistence', err));
    }
  }

  /** ✅ دالة عامة لتشغيل أي كود داخل الـ context */
  private withContext<T>(callback: () => Promise<T>): Promise<T> {
    return runInInjectionContext(this.injector, callback);
  }

  /** ✅ تحميل بيانات المستخدم من Firestore أو من fallback */
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

  /** ✅ listener لمتابعة حالة تسجيل الدخول */
  private initAuthListener() {
    if (this.user$Initialized) return;
    this.user$Initialized = true;

    runInInjectionContext(this.injector, () => {
      authState(this.auth).subscribe(async (user) => {
        if (!user) {
          this.setUser(null);
          return;
        }

        try {
          await this.withContext(async () => { // ✅ أضف دي
            const userRef = doc(this.firestore, 'users', user.uid);
            const snap = await getDoc(userRef);
            const userData = snap.exists() ? snap.data() : {};
            this.setUser({ ...user, ...userData } as User);
          });
        } catch (err) {
          console.error('⚠️ Error fetching Firestore user data:', err);
          this.setUser(user);
        }
      });
    });
  }

  /** ✅ حفظ المستخدم في الذاكرة */
  public setUser(user: User | null) {
    this.currentUserSubject.next(user);
  }

  /** ✅ إنشاء حساب جديد بالبريد */
  async registerWithEmail(
    email: string,
    password: string,
    displayName?: string,
    phoneNumber?: string,
    gender?: string,
    interests: string[] = []
  ) {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);

    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }

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
      interests: interests || [],
    };

    await this.userService.save(newUserData);
    const dbUser = await this.userService.getUserById(refreshedUser.uid);

    this.setUser({ ...refreshedUser, ...(dbUser || {}) } as User);
    return { ...refreshedUser, ...(dbUser || {}) };
  }

  /** ✅ تسجيل الدخول بالبريد */
  async loginWithEmail(email: string, password: string) {
    return this.withContext(async () => {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    });
  }

  /** ✅ التحقق إن كان المستخدم جديد لأول مرة */
  async isFirstTimeUser(uid: string): Promise<boolean> {
    return this.withContext(async () => {
      try {
        const ref = doc(this.firestore, 'users', uid);
        const snapshot = await getDoc(ref);
        return !snapshot.exists();
      } catch (error) {
        console.error('🔥 Error checking first time user:', error);
        return false;
      }
    });
  }

  /** ✅ تسجيل الدخول باستخدام Google */
  async loginWithGoogle() {
    return this.withContext(async () => {
      const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
      const user = result.user;
      await this.userService.save(user);
      this.setUser(user);
      this.zone.run(() => this.router.navigate(['/home']));
      return user;
    });
  }

  /** ✅ تسجيل الخروج */
  async logout() {
    this.setUser(null);
    await signOut(this.auth);
    this.zone.run(() => this.router.navigateByUrl('/login'));
  }

  /** ✅ هل المستخدم مسجل الدخول حالياً؟ */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /** ✅ تحديث بيانات المستخدم من Firestore */
  async refreshUserData() {
    const user = this.currentUserSubject.value;
    if (!user) return;
    await this.loadUserData(user.uid, user);
  }
}
