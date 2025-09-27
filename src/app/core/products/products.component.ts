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
    { name: 'Computer Science', price: 65, image: 'https://www.venturelessons.com/wp-content/uploads/2019/05/computer-science-online-courses-feature.jpg' },
    { name: 'Ethical Hacking', price: 72, image: 'https://icttube.com/wp-content/uploads/2023/04/Ethical-Hacking-Full-Course-2023-in-20-Hours.jpg' },
    { name: 'English Courses', price: 50, image: 'https://cdn.prod.website-files.com/60c39415644232ae43326cc1/65118ba485fd40b7409f8442_Free%20english%20courses%20on%20Heylama.png' },
    { name: 'Machien Learning Courses', price: 90, image: 'https://media.assettype.com/analyticsinsight/2024-07/dd2f16e2-d3dc-432c-938a-9ed62ea3f11b/Top_Machine_Learning_Certificate_Courses_to_Enroll_in_2022.jpg' }
  ];
  responsiveOptions = [
  {
    breakpoint: '768px',   // عند الشاشات أقل من 768
    numVisible: 1,
    numScroll: 1
  },
  {
    breakpoint: '1024px',  // عند التابلت
    numVisible: 2,
    numScroll: 1
  }
];
}
