import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { homeService } from '../service/home.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ChartModule, ButtonModule, RouterModule,ProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  detailsData: any = {}; // ⬅️ يكون object
  isDetailsPage = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private homeService: homeService
  ) {}

  ngOnInit(): void {
    this.homeService.getDetails().subscribe({
      next: (data) => {
        this.detailsData = data;
      },
      error: (err) => console.error('❌ Error loading details', err),
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        this.isDetailsPage = this.router.url.includes('chardetails');
      });
  }

  goToDetails(index: number) {
    localStorage.setItem('selectedIndex', index.toString());
    this.router.navigate(['/home/chardetails']);
  }
}
