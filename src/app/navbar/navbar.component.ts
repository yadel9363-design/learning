import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { Ripple } from 'primeng/ripple';
import { MenubarModule } from 'primeng/menubar';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-navbar',
  imports: [BadgeModule, AvatarModule, InputTextModule, Ripple, CommonModule, MenubarModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
    items: MenuItem[] | undefined;

    ngOnInit() {
        this.items = [
            {
                label: 'Home',
            },
            {
                label: 'Projects',
                icon: 'pi pi-search',
                items: [
                    {
                        label: 'Products',
                        routerLink: 'products'
                    },
                    {
                        label: 'Orders',
                        routerLink: 'orders'
                    },
                    {
                        label: 'Manage Orders',
                        routerLink: 'admin/orders'
                    },
                    {
                        label: 'Manage Products',
                        routerLink: 'admin/products'
                    },
                ],
            },
        ];
    }
}
