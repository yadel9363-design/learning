import { Component } from '@angular/core';
import { DrawerModule } from 'primeng/drawer';
import { ButtonModule } from 'primeng/button';
import { RouterLink, RouterLinkActive  } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DrawerService } from '../service/sidebar.service';





@Component({
  selector: 'app-sidebar',
  imports: [
    DrawerModule,
    ButtonModule,
    RouterLink,
    CommonModule,
    RouterLinkActive
],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  visible = false;

  constructor(private drawerService: DrawerService) {
    this.drawerService.drawerState$.subscribe((state) => {
      this.visible = state;
    });
  }

  itemsList = [
    { label: 'Products', routerLink: 'products' },
    { label: 'Orders', routerLink: 'orders' },
    { label: 'Manage Orders', routerLink: 'admin/orders' },
    { label: 'Manage Products', routerLink: 'admin/products' },
  ];
  closeDrawer() {
  this.visible = false;
}
}
