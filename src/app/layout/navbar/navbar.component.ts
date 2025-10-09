import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { MenuModule } from 'primeng/menu';
import { DrawerService } from '../sidebar/service/sidebar.service';
import { AuthService } from '../../shared/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    BadgeModule,
    AvatarModule,
    InputTextModule,
    CommonModule,
    MenubarModule,
    ButtonModule,
    MenuModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];
  itemsMobile: MenuItem[] = [];
  username: User | null = null;
  private router = inject(Router);
  private auth = inject(Auth);
  private drawerService = inject(DrawerService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  @ViewChild('menu') menu: any;
  menuOpen = false;
 photoURL?: string;

  toggleDrawer() {
    this.drawerService.open();
  }

  constructor() {
  }

  ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.username = user;
        this.photoURL = user.photoURL ?? undefined;
        this.setupMenu();
        this.setupMenuMobile();
        this.cdr.detectChanges(); // 👈 يجبر PrimeNG على التحديث
      }
    });
  }

Logout() {
  signOut(this.auth)
    .then(() => {
      this.username = null;
      this.setupMenu();
      this.setupMenuMobile();
      this.router.navigate(['/login']);
    })
    .catch((error) => {
      console.error('فشل تسجيل الخروج:', error);
    });
}
getProfile(){
  this.router.navigateByUrl('/profile')
}
setupMenu() {
  const itemsChildren: MenuItem[] = [
    {
      label: 'Profile',
      command: () => this.getProfile(),
    },
    {
      separator: true,
    },
    {
      label: 'Logout',
      command: () => this.Logout(),
    }
  ];

  this.items = [];

if (this.username) {
  this.items = [

    {
      label: this.username?.displayName ? 'hello, ' + this.username.displayName : '',
      items: itemsChildren
    }
  ];
} else {
    this.items = [];
  }
}
setupMenuMobile() {
  this.itemsMobile = [];

  if (this.username) {
    this.itemsMobile = [
      {
        label: 'Profile',
        command: () => this.getProfile(),
      },
      {
        separator: true,
      },
      {
        label: 'Logout',
        command: () => this.Logout(),
      }
    ];
  }
}
toggleMenu(event: Event) {
  this.menu.toggle(event);
  this.menuOpen = !this.menuOpen;
}
}
