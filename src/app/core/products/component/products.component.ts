import {
  Component,
  ElementRef,
  inject,
  OnInit,
  QueryList,
  ViewChildren,
  AfterViewInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { ButtonModule } from 'primeng/button';
import { TabsModule } from 'primeng/tabs';
import { TableModule } from 'primeng/table';
import { CourseService } from '../../my-orders/service/course.service';
import { take } from 'rxjs/operators';
import { DialogModule } from 'primeng/dialog';


@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, CarouselModule, ButtonModule, TableModule, TabsModule,DialogModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  courses: any = {};
  categories: any[] = [];
  selectedCategory: string | null = null;
  activeIndex: number = 0;
  visible: boolean = false;
  private courseService = inject(CourseService);

  @ViewChildren('tabRef') tabElements!: QueryList<ElementRef>;

  responsiveOptions = [
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
  ];

  ngOnInit() {
  this.courseService
    .getCourses()
    .pipe(take(1))
    .subscribe((data) => {
      this.courses = data;
      if (this.courses) {
        this.categories = Object.entries(this.courses).map(([key, value]) => ({
          key,
          value,
          image: this.getCategoryImage(key), // ✅ أضفنا الصورة هنا
        }));

        if (this.categories.length > 0) {
          this.selectedCategory = this.categories[0].key;
          this.activeIndex = 0;
        }
      }
    });
  }

  ngAfterViewInit() {
    // ✅ عند تحميل التابات نعمل Scroll لأول تاب
    setTimeout(() => {
      const firstTab = this.tabElements.first?.nativeElement;
      if (firstTab) {
        firstTab.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }, 300);
  }

  selectCategory(key: string, index: number) {
    this.selectedCategory = key;
    this.activeIndex = index;

    // ✅ نعمل Scroll للتاب اللي اتضغط عليه
    setTimeout(() => {
      const tabsArray = this.tabElements.toArray();
      const activeTab = tabsArray[index]?.nativeElement;
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
    }, 100);
  }

    showDialog() {
        this.visible = true;
    }

  getCategoryImage(categoryKey: string): string {
  const images: { [key: string]: string } = {
    'Artificial Intelligence': 'assets/images/AI.jpg',
    'English Course': 'assets/images/EC.jpg',
    'Cloud Computing': 'assets/images/CC.png',
    'Data Science': 'assets/images/DS.png',
    'Programming Courses': 'assets/images/Prog.png',
    'Cyber Security': 'assets/images/CS.png',
    'Mobile Development': 'assets/images/MD.png',
    'Web Development': 'assets/images/WD.jpg',
  };

  // لو مفيش صورة مخصصة، استخدم صورة افتراضية
  return images[categoryKey] || 'https://via.placeholder.com/400x200?text=' + encodeURIComponent(categoryKey);
}
}
