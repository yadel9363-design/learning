import { Injectable, NgZone, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import {
  Auth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  authState,
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { UserService } from './user.service';
import { Router } from '@angular/router';
import { updateProfile } from 'firebase/auth';


@Injectable({ providedIn: 'root' })
export class AuthService implements OnInit {
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
      authState(this.auth).subscribe((user) => {
        this.zone.run(() => {
          this.currentUserSubject.next(user);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            this.userService.save(user); // 🟢 تحديث DB
          }
        });
      });

      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  ngOnInit(): void {
  if (isPlatformBrowser(this.platformId)) {
    authState(this.auth).subscribe((user) => {
      this.zone.run(() => {
        this.currentUserSubject.next(user);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          this.userService.save(user);
        }
      });
    });
  }
  }

  setUser(user: User) {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  // ✅ تسجيل مستخدم جديد
async registerWithEmail(email: string, password: string, displayName?: string) {
  const cred = await createUserWithEmailAndPassword(this.auth, email, password);

  // ✅ حدّث البروفايل فورًا بعد التسجيل
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }

  // 🟢 خزّن/حدّث بيانات المستخدم في DB بالاسم
  await this.userService.save({
    ...cred.user,
    displayName: displayName || cred.user.displayName || ''
  });

  this.setUser(cred.user);
  return cred.user;
}

  // ✅ تسجيل الدخول بالإيميل والباسورد
  async loginWithEmail(email: string, password: string) {
    const cred = await signInWithEmailAndPassword(this.auth, email, password);
    this.setUser(cred.user);
    await this.userService.save(cred.user); // 🟢 تحديث بياناته
    return cred.user;
  }

  // ✅ تسجيل الدخول بجوجل
  async loginWithGoogle() {
    const result = await signInWithPopup(this.auth, new GoogleAuthProvider());
    const user = result.user;

    this.setUser(user);
    await this.userService.save(user);

    // 🟢 تحقق من الـ Profile
    const profile = await firstValueFrom(this.userService.getUserProfile(user.uid));
    this.zone.run(() => {
      if (profile?.isAdmin) {
        this.router.navigate(['/admin/products']);
      } else {
        this.router.navigate(['/products']);
      }
    });

    return user;
  }

  // ✅ تسجيل الخروج
  async logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
    await signOut(this.auth);
    this.zone.run(() => this.router.navigate(['/login']));
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
