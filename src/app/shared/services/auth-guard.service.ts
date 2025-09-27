import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Promise<boolean | UrlTree> {
    return new Promise((resolve) => {
      onAuthStateChanged(this.auth, (user) => {
        if (user) {
          resolve(true);
        } else {
          resolve(this.router.createUrlTree(['/login']));
        }
      });
    });
  }
}
