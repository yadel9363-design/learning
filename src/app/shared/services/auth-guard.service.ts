import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Promise<boolean | UrlTree> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          resolve(true); // ✅ يسمح بالدخول
        } else {
          resolve(this.router.createUrlTree(['/login'])); // ⛔️ يرجع على login
        }
      });
    });
  }
}
