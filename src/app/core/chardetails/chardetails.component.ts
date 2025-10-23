import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { homeService } from '../home/service/home.service';

@Component({
  selector: 'app-chardetails',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './chardetails.component.html',
  styleUrls: ['./chardetails.component.scss']
})
export class ChardetailsComponent implements OnInit {
  item: any = null;
  courses: any[] = [];

  constructor(private router: Router, private homeService: homeService) {}

  ngOnInit(): void {
    const savedIndex = localStorage.getItem('selectedIndex');
    const index = savedIndex ? parseInt(savedIndex, 10) : 0;

    this.homeService.getDetails().subscribe({
      next: (data: any) => {
        if (data && data.label && data.label[index]) {
          const detailGroup = data.details[index];

          this.item = {
            label: data.label[index],
            description: data.description[index],
            img: data.image[index],
            rate: data.rate[index],
            price: data.price[index],
            background: data.background[index]
          };

          // ✅ بناء الكورسات مع حماية ضد undefined
          if (detailGroup?.title?.length) {
            this.courses = detailGroup.title.map((t: string, i: number) => ({
              title: t,
              duration: detailGroup.duration?.[i] ?? 'N/A',
              level:
                detailGroup.level?.[i % detailGroup.level.length] ?? 'Beginner'
            }));
          }
        }
      },
      error: (err) => {
        console.error('❌ Error loading details', err);
      }
    });
  }

  goBackHome() {
    localStorage.removeItem('selectedIndex');
    this.router.navigate(['home'], { state: { fromDetails: true } });
  }
}
