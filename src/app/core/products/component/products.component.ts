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
import { PaginatorModule } from 'primeng/paginator';
import { AccordionModule } from 'primeng/accordion';
import AOS from 'aos';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    CarouselModule,
    ButtonModule,
    TableModule,
    TabsModule,
    DialogModule,
    PaginatorModule,
    AccordionModule
  ],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  courses: any = {};
  categories: any[] = [];
  selectedCategory: string | null = null;
  activeAccordionIndex: number | null = null;
  activeIndex: number = 0;
  first1: number = 0;
  visible: boolean = false;
  private courseService = inject(CourseService);

  @ViewChildren('tabRef') tabElements!: QueryList<ElementRef>;
  @ViewChildren('boxRef', { read: ElementRef }) boxElements!: QueryList<ElementRef>;

  responsiveOptions = [
    { breakpoint: '768px', numVisible: 1, numScroll: 1 },
    { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
  ];

  data = [
    {
      number: 850,
      name: 'Customers',
      opinion: 'You can Watch Our Customers Opinion From Here.',
      animation: 'fade-right',
      displayedNumber: 0,
      value: 1
    },
    {
      number: 1200,
      name: 'Students',
      opinion: 'Trusted by learners around the world.',
      animation: 'fade-up',
      displayedNumber: 0,
      value: 2
    },
    {
      number: 320,
      name: 'Courses',
      opinion: 'Learn from a wide range of quality content.',
      animation: 'fade-right',
      displayedNumber: 0,
      value: 3
    },
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
            image: this.getCategoryImage(key),
          }));

          if (this.categories.length > 0) {
            this.selectedCategory = this.categories[0].key;
            this.activeIndex = 0;
          }
        }
      });
  }

  ngAfterViewInit() {
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

    // ✅ تهيئة AOS
    AOS.init({
      duration: 800,
      once: false,
      offset: 100,
    });

    // ✅ مراقبة العناصر لتشغيل العدّاد
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = this.boxElements.toArray().findIndex(
              (el) => el.nativeElement === entry.target
            );
            if (index !== -1) this.animateCounter(index);
          }
        });
      },
      { threshold: 0.5 }
    );

    this.boxElements.forEach((el) => observer.observe(el.nativeElement));

    // ✅ تحديث AOS عند تغيّر عناصر الـ box
    this.boxElements.changes.subscribe(() => AOS.refresh());
  }

  /** ✅ حركة العد التزايدي */
  private animateCounter(index: number) {
    const item = this.data[index];
    if (!item || item.displayedNumber >= item.number) return;

    const duration = 1500;
    const steps = 60;
    const increment = item.number / steps;
    let current = 0;

    const interval = setInterval(() => {
      current += increment;
      if (current >= item.number) {
        item.displayedNumber = item.number;
        clearInterval(interval);
      } else {
        item.displayedNumber = Math.floor(current);
      }
    }, duration / steps);
  }

  /** ✅ عند الضغط على تاب */
  selectCategory(key: string, index: number) {
    this.selectedCategory = key;
    this.activeIndex = index;
    this.first1 = index;

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

  /** ✅ عند تغيير الصفحة من الـ paginator */
  onPageChange1(event: any) {
    this.activeIndex = event.page;
    setTimeout(() => {
      const activeTab = document.querySelector(
        `.custom-tabs .p-tablist .p-tab:nth-child(${this.activeIndex + 1})`
      );
      if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }, 100);
  }

  /** ✅ عند فتح الـ Dialog */
showDialog(key: string) {
  this.selectedCategory = key;
  this.visible = true;

  // ⏱️ بعد ما يظهر الـ Dialog فعليًا
  setTimeout(() => {
    // ✅ نعيد تصفير العدادات قبل البدء
    this.data.forEach((item) => (item.displayedNumber = 0));

    // ✅ نعيد تهيئة الـ AOS علشان الـ animation يشتغل تاني
    AOS.refreshHard(); // يضمن إعادة تفعيل كل التأثيرات من البداية

    // ✅ نبدأ العدّ التزايدي من جديد
    this.data.forEach((_, i) => this.animateCounter(i));
  }, 400);
}


  /** ✅ إرجاع الصورة حسب نوع الكورس */
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

    return (
      images[categoryKey] ||
      'https://via.placeholder.com/400x200?text=' +
        encodeURIComponent(categoryKey)
    );
  }
}
