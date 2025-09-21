import { Injectable, NgZone, Inject, PLATFORM_ID } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, authState, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  user$: Observable<User | null> = this.currentUserSubject.asObservable();

  constructor(private auth: Auth, private zone: NgZone, @Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      // متابعة حالة المستخدم من Firebase
      authState(this.auth).subscribe(user => {
        this.zone.run(() => {
          this.currentUserSubject.next(user);
          if (user) localStorage.setItem('user', JSON.stringify(user));
        });
      });

      // استرجاع المستخدم من localStorage
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  setUser(user: User) {
    this.currentUserSubject.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  loginWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  logout() {
    this.currentUserSubject.next(null);
    localStorage.removeItem('user');
    return signOut(this.auth);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}
