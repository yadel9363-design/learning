import { Component, NgZone, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/component/sidebar.component';
import { AuthService } from './shared/services/auth.service';
import { User } from 'firebase/auth';
import { Observable, of } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { UserService } from './shared/services/user.service';
import { AppUser } from './shared/DTO/user.model';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet, SidebarComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'learning';
  user$: Observable<User | null>;
  lastSignInDate: Date | null = null;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.user$ = this.authService.user$;
  }

async ngOnInit(): Promise<void> {
  this.user$
    .pipe(
      switchMap((user) => {
        if (!user) return of(null);
        if (user.metadata?.lastSignInTime) {
          this.lastSignInDate = new Date(user.metadata.lastSignInTime);
        }

        if (user && this.router.url === '/login') {
          this.router.navigateByUrl('/home');
        }

        return this.userService.getCurrentUserData();
      })
    )
    .subscribe((appUser: AppUser | null) => {
      if (!appUser) {
        return;
      }

      if (appUser.isAdmin) {
        this.userService.updateOldUsers();
      } else {
      }
    });
}


  async signInWithGoogle() {
    await this.authService.loginWithGoogle();
  }

  logout() {
    this.authService.logout();
  }
}
