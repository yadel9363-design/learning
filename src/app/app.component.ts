import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar/navbar.component';
import { RouterOutlet } from '@angular/router';



@Component({
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    RouterOutlet,
],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'learning';
}
