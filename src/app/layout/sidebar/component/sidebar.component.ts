import { Component, OnInit } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DrawerService } from '../service/sidebar.service';
import { take } from 'rxjs';
import { AppUser } from '../../../shared/DTO/user.model';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    DrawerModule,
    ButtonModule,
    RouterLink,
    RouterLinkActive,
    CommonModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'], // ✅ fixed
})
export class SidebarComponent implements OnInit {
  visible = false;
  isAdmin = false;
  itemsList: Array<{ label: string; routerLink: string }> = [];

  constructor(
    private drawerService: DrawerService,
    private userService: UserService
  ) {
    this.drawerService.drawerState$.subscribe((state) => {
      this.visible = state;
    });
  }

  ngOnInit() {
    this.checkIfAdmin();
  }

  private checkIfAdmin() {
    this.userService.getCurrentUserData().pipe(take(1)).subscribe((userData: AppUser | null) => {
      this.isAdmin = !!userData?.isAdmin;
      this.buildMenu();
    });
  }

  private buildMenu() {
    this.itemsList = [
      { label: 'Activities', routerLink: 'home' },
      { label: 'Products', routerLink: 'products' },
      { label: 'Orders', routerLink: 'orders' },
    ];

    if (this.isAdmin) {
      this.itemsList.push(
        { label: 'Manage Orders', routerLink: 'admin/orders' },
        { label: 'Manage Products', routerLink: 'admin/products' }
      );
    }
  }

  closeDrawer() {
    this.visible = false;
  }
}
