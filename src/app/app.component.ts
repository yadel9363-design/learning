import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './layout/sidebar/component/sidebar.component';
import { User } from '@angular/fire/auth';


@Component({
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterOutlet,
    SidebarComponent
],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'learning';
  username: User | null = null;
}
