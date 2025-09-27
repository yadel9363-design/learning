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

 photoURL?: string;

  toggleDrawer() {
    this.drawerService.open();
  }

  constructor() {
  onAuthStateChanged(this.auth, (user) => {
    this.username = user;
    this.photoURL = user?.photoURL ?? undefined;
    this.setupMenu();         // desktop menu
    this.setupMenuMobile();   // mobile menu
  });
  }

  ngOnInit() {
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

setupMenu() {
  const itemsChildren: MenuItem[] = [
    {
      label: 'Logout',
      command: () => this.Logout(),
    },
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
        label: 'Logout',
        command: () => this.Logout(),
      }
    ];
  }
}
}
