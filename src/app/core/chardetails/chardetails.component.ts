import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router } from '@angular/router';
import { homeService } from '../home/service/home.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-chardetails',
  standalone: true,
  imports: [CommonModule, ButtonModule, ToastModule],
  templateUrl: './chardetails.component.html',
  styleUrls: ['./chardetails.component.scss']
})
export class ChardetailsComponent implements OnInit {
  item: any = null;
  courses: any[] = [];

  constructor(
    private router: Router,
    private homeService: homeService,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const encodedId = this.route.snapshot.paramMap.get('id');

    if (!encodedId) {
      this.router.navigate(['/home']);
      return;
    }

    let index: number | null = null;

    try {
      // فك تشفير الـ ID
      const decodedObj = JSON.parse(atob(encodedId));
      index = decodedObj.index;
    } catch (err) {
      console.error('Invalid ID format:', err);
      this.router.navigate(['/home']);
      return;
    }

    // ✅ تحميل البيانات بناءً على الـ index المستخرج
    this.homeService.getDetails().subscribe({
      next: (data: any) => {
        if (data && data.label && data.label[index!]) {
          const detailGroup = data.details[index!];

          this.item = {
            label: data.label[index!],
            description: data.description[index!],
            img: data.image[index!],
            rate: data.rate[index!],
            price: data.price[index!],
            background: data.background[index!]
          };

          if (detailGroup?.title?.length) {
            this.courses = detailGroup.title.map((t: string, i: number) => ({
              title: t,
              duration: detailGroup.duration?.[i] ?? 'N/A',
              level:
                detailGroup.level?.[i % detailGroup.level.length] ?? 'Beginner'
            }));
          }
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) =>
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err
        })
    });
  }

  goBackHome() {
    this.router.navigate(['home'], { state: { fromDetails: true } });
  }
}
