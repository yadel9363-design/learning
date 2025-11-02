import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  imports: [
    ButtonModule
  ],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss'
})
export class NotFoundComponent {
goToDashboard() {
  // مثال بسيط للانتقال إلى الصفحة الرئيسية
  window.location.href = '/login';
}
}
