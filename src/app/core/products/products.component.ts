import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CarouselModule, ButtonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  products = [
    { name: 'Bamboo Watch', price: 65, image: 'https://primefaces.org/cdn/primeng/images/demo/product/bamboo-watch.jpg' },
    { name: 'Black Watch', price: 72, image: 'https://primefaces.org/cdn/primeng/images/demo/product/black-watch.jpg' },
    { name: 'Blue Band', price: 79, image: 'https://primefaces.org/cdn/primeng/images/demo/product/blue-band.jpg' },
    { name: 'Blue T-Shirt', price: 29, image: 'https://primefaces.org/cdn/primeng/images/demo/product/blue-t-shirt.jpg' }
  ];
}
