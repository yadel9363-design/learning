import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { map, Observable } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UserAuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

canActivate() {
  return this.userService.getCurrentUserData().pipe(
    map(user => {
      if (user && user.isAdmin === true) {
        return true;
      } else {
        this.router.navigate(['/no-access']);
        return false;
      }
    })
  );
}

}
