import { Component, NgZone, Inject, PLATFORM_ID, OnInit, Input, Output } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/component/sidebar.component';
import { AuthService } from './shared/services/auth.service';
import { signOut, User } from 'firebase/auth';
import { Observable, of } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { UserService } from './shared/services/user.service';
import { AppUser } from './shared/DTO/user.model';
import { filter, switchMap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { Auth } from '@angular/fire/auth';
import { FooterComponent } from './layout/footer/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterOutlet,
    SidebarComponent,
    FooterComponent,
    ToastModule,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'learning';
  user$: Observable<User | null>;
  lastSignInDate: Date | null = null;
  firstLoginInProgress = false;
  showLayout = true;
  sidebarVisible = false;

toggleSidebar() {
  this.sidebarVisible = !this.sidebarVisible;
}

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
    private messageService: MessageService,
    private auth: Auth
  ) {
    this.user$ = this.authService.user$;

    // ✅ راقب تغيّر المسارات
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        this.showLayout = !(url.includes('/login') || url.includes('/register'));
      });
  }

ngOnInit(): void {
  this.user$
    .pipe(
      switchMap((user) => {
        if (!user) return of(null);

        const inProgress = localStorage.getItem('firstLoginInProgress');
        if (user && inProgress === 'true') {
          localStorage.removeItem('firstLoginInProgress'); // ✅ تنظيف تلقائي
        }

        if (user.metadata?.lastSignInTime) {
          this.lastSignInDate = new Date(user.metadata.lastSignInTime);
        }

        return this.userService.getCurrentUserData().pipe(
          switchMap((appUser) => {
            if (user && this.router.url === '/login') {
              this.zone.run(() => {
                if (appUser?.interests?.length) {
                  this.router.navigateByUrl('/home');
                }
              });
            }
            return of(appUser);
          })
        );
      })
    )
    .subscribe();
}


async logout() {
  await signOut(this.auth);
  localStorage.clear();
  this.authService.setUser(null);

  this.zone.run(() => {
    this.router.navigateByUrl('/login');
  });
}

}
