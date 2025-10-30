import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { CourseService } from '../../my-orders/service/course.service';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';


@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    GalleriaModule,
    ButtonModule,
    AnimateOnScrollModule
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  imagesData: any = { images: [] };
  courses: any = {};
  categories: any[] = [];

  constructor(
    private http: HttpClient,
    private courseService: CourseService
  ) {}

  ngOnInit(): void {
    this.loadImages();
    this.loadCourses();
  }

  loadImages() {
    this.http.get('assets/DTO/images.service.json').subscribe({
      next: (img: any) => {
        this.imagesData = img;
        setTimeout(() => this.triggerAnimation(), 500);
      },
      error: (err) => console.error('❌ Error loading images:', err)
    });
  }

  triggerAnimation(): void {
    const imgs = document.querySelectorAll('.fade-img');
    imgs.forEach((img) => {
      img.classList.remove('animate');
      void (img as HTMLElement).offsetWidth;
      img.classList.add('animate');
    });
  }

  loadCourses() {
    this.courseService
      .getCourses()
      .pipe(take(1))
      .subscribe((data) => {
        this.courses = data;

        this.categories = Object.entries(this.courses).map(([key, value]: any) => {
          const originalPrice = value.price ?? 0;
          const discountedPrice = +(originalPrice * 0.7).toFixed(2);

          return {
            key,
            value: {
              ...value,
              originalPrice,
              discountedPrice,
            },
          };
        });

        console.log('📘 categories with discount:', this.categories);
      });
  }
}
