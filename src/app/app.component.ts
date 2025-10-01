import { Component, NgZone, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { SidebarComponent } from './layout/sidebar/component/sidebar.component';
import { AuthService } from './shared/services/auth.service';
import { User } from 'firebase/auth';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, NavbarComponent, RouterOutlet, SidebarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'learning';
  user$: Observable<User | null>;
  lastSignInDate: Date | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private zone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.user$ = this.authService.user$;
  }

  ngOnInit(): void {
    this.user$.subscribe(user => {
      if (user?.metadata?.lastSignInTime) {
        this.lastSignInDate = new Date(user.metadata.lastSignInTime);
      }

      // إعادة توجيه من login إذا المستخدم موجود
      if (user && this.router.url === '/login') {
        this.router.navigateByUrl('/home');
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
