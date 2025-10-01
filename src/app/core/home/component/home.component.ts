import { Component, OnInit, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { HomeService } from '../service/home.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CourseService } from '../../my-orders/service/course.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [ChartModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  coursesDoughnut: any = {};
  optionsDoughnut: any;

  coursesBar: any = {};
  optionsBar: any;

  platformId = inject(PLATFORM_ID);
  private courseService = inject(CourseService);
  private homeService = inject(HomeService);

  constructor(private cd: ChangeDetectorRef) {}

  ngOnInit() {
    this.initCharts();
  }

  initCharts() {
    this.courseService.getCourses().pipe(take(1)).subscribe(data => {
      console.log('Courses loaded:', data);

      const labels = Object.keys(data);
      const courseLists = Object.values(data) as string[][];
      const values = courseLists.map(arr => arr.length);

      const colors = ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'];

      // 🎯 Doughnut chart
      this.coursesDoughnut = {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: labels.map((_, i) => colors[i % colors.length]),
            hoverBackgroundColor: labels.map((_, i) => colors[i % colors.length])
          }
        ]
      };

      this.optionsDoughnut = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#333'
            }
          },
          tooltip: {
            callbacks: {
              label: (context: any) => {
                const index = context.dataIndex;
                const courses = courseLists[index];
                return `Courses → [${courses.join(', ')}]`;
              }
            }
          }
        }
      };

      // 🎯 Bar chart
this.coursesBar = {
  labels: labels, // 👈 المحور X فيه أسماء الـ categories
  datasets: labels.map((category, i) => ({
    label: category,  // 👈 هنا كل كاتيجوري ليه label خاص بيه
    data: labels.map((_, j) => (i === j ? values[i] : 0)), // 👈 بار واحد لكل كاتيجوري
    backgroundColor: colors[i % colors.length],
    hoverBackgroundColor: colors[i % colors.length]
  }))
};


this.optionsBar = {
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const index = context.dataIndex;
          const courses = courseLists[index];
          return `Courses → [${courses.join(', ')}]`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

      this.cd.markForCheck();
    });
  }
}
