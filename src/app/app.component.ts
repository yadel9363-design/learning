import { Component, NgZone, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Router,
  RouterOutlet,
  NavigationStart,
  NavigationEnd,
  NavigationCancel,
  NavigationError,
} from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/component/sidebar.component';
import { FooterComponent } from './layout/footer/footer.component';
import { AuthService } from './shared/services/auth.service';
import { signOut, User } from 'firebase/auth';
import { Observable, of } from 'rxjs';
import { ToastModule } from 'primeng/toast';
import { UserService } from './shared/services/user.service';
import { filter, switchMap } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { Auth } from '@angular/fire/auth';
import { LoadingComponent } from './core/loading/loading.component';

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
    LoadingComponent,
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
  isLoading = true; // 👈 يبدأ اللودينج مفعّل أول مرة

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
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        this.isLoading = true;
      }

      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        setTimeout(() => (this.isLoading = false), 400);
      }
    });
  }

  ngOnInit(): void {
    // ✅ في أول تحميل للصفحة (reload)
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => (this.isLoading = false), 700); // تأخير بسيط لتحميل الـ router-outlet
    }

    this.user$
      .pipe(
        switchMap((user) => {
          if (!user) return of(null);

          const inProgress = localStorage.getItem('firstLoginInProgress');
          if (user && inProgress === 'true') {
            localStorage.removeItem('firstLoginInProgress');
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

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
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
