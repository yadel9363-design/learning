// floating-customers.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-floating-customers',
  templateUrl: './floating-customers.component.html',
  imports: [
    CommonModule
  ],
  styleUrls: ['./floating-customers.component.scss']
})
export class FloatingCustomersComponent {
  @Input() customers: { name: string, icon: string }[] = [];

  // هنا بنكرر العناصر عشان يكون ال scroll مستمر بدون توقف
  get repeatedCustomers() {
    return [...this.customers, ...this.customers];
  }
}
