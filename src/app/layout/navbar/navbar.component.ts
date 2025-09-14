import { Component, OnInit, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { Auth, onAuthStateChanged, signOut, User } from '@angular/fire/auth';
import { Router } from '@angular/router';


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
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnInit {
  items: MenuItem[] = [];
  username: User | null = null;
  private router = inject(Router);
  private auth = inject(Auth);
 photoURL?: string;


  constructor() {
    onAuthStateChanged(this.auth, (user) => {
      this.username = user;
      this.photoURL = user?.photoURL ?? undefined;
      this.setupMenu();
    });
  }

  ngOnInit() {
  }

  Logout() {
    signOut(this.auth)
    .then(() => {
      this.username = null;
      this.setupMenu();
      this.router.navigate(['/login']);
    })
    .catch((error) => {
      console.error('فشل تسجيل الخروج:', error);
    });
  }

setupMenu() {
  const itemsChildren: MenuItem[] = [
    { label: 'Products', routerLink: 'products' },
    { label: 'Orders', routerLink: 'orders' },
    { label: 'Manage Orders', routerLink: 'admin/orders' },
    { label: 'Manage Products', routerLink: 'admin/products' },
  ];

  this.items = [];

if (this.username) {
  this.items = [
    {
      label: 'Logout',
      command: () => this.Logout(),
    },
    {
      label: 'Home',
      items: itemsChildren,
    }
  ];
} else {
    this.items = [];
  }
}

}
