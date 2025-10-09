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
  itemsList: Array<{ label: string; routerLink: string; icon: string }> = [];

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
      { label: 'Activities', routerLink: 'home', icon: 'fa-solid fa-house' },
      { label: 'Courses', routerLink: 'products', icon: 'fa-solid fa-layer-group' },
      { label: 'Orders', routerLink: 'orders', icon: 'fa-solid fa-server' },
    ];

    if (this.isAdmin) {
      this.itemsList.push(
        { label: 'Manage Orders', routerLink: 'admin/orders', icon: 'fa-solid fa-book-tanakh' },
        { label: 'Manage Products', routerLink: 'admin/products', icon: 'fa-solid fa-book-tanakh' }
      );
    }
  }

  closeDrawer() {
    this.visible = false;
  }
}
