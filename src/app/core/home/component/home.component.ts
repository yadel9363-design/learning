import { Component, OnInit, PLATFORM_ID, ChangeDetectorRef, inject } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { CourseService } from '../../my-orders/service/course.service';
import { take } from 'rxjs';
import dayjs from 'dayjs';

@Component({
  selector: 'app-home',
  imports: [ChartModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  coursesBar: any = {};
  optionsBar: any;

  platformId = inject(PLATFORM_ID);
  private courseService = inject(CourseService);
  private cd = inject(ChangeDetectorRef);

  ngOnInit() {
    this.initCharts();
  }

initCharts() {
  this.courseService.getCourses().pipe(take(1)).subscribe((data: any) => {
    const grouped: Record<string, { count: number, categories: string[] }> = {};

    Object.keys(data).forEach(catKey => {
      const category = data[catKey];
      if (category && category.createdAt) {
        const dayStr = dayjs(category.createdAt).format('YYYY-MM-DD');

        if (!grouped[dayStr]) {
          grouped[dayStr] = { count: 0, categories: [] };
        }

        grouped[dayStr].count++;
        grouped[dayStr].categories.push(catKey); // 🟢 حفظ اسم الكاتيجوري
      }
    });

    const labels = Object.keys(grouped).sort();
    const counts = labels.map(day => grouped[day].count);

    this.coursesBar = {
      labels: labels.map(d => dayjs(d).format('MMM DD')),
      datasets: [
        {
          label: 'عدد الكاتيجوريز',
          data: counts,
          backgroundColor: '#42A5F5',
          hoverBackgroundColor: '#1E88E5',
          hoverOffset: 8,
          borderRadius: 6,
          barPercentage: 0.5,
          categoryPercentage: 0.6,
          maxBarThickness: 15
        }
      ]
    };

    this.optionsBar = {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              const dayIndex = context.dataIndex;
              const dayKey = labels[dayIndex]; // YYYY-MM-DD
              const dayCategories = grouped[dayKey]?.categories || [];
              const names = dayCategories.join(', ');
              return `${dayCategories.length} Categories [${names}]`;
            }
          }
        }
      },
      animation: {
        duration: 600,
        easing: 'easeOutQuart'
      },
      interaction: {
        mode: 'nearest',
        intersect: true
      },
      datasets: {
        bar: {
          hoverBackgroundColor: '#1E88E5',
        }
      },
      scales: {
        x: {
          ticks: { color: '#666' },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: { stepSize: 2, color: '#666' },
          grid: { drawBorder: false }
        }
      }
    };

    this.cd.markForCheck();
  });
}

}
