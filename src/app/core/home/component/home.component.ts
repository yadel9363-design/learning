import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { ActivatedRoute, Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { homeService } from '../service/home.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ChartModule, ButtonModule, RouterModule, ProgressSpinnerModule, ToastModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  detailsData: any = {};
  isDetailsPage = false;

  constructor(
    private router: Router,
    private homeService: homeService,
    private messageService: MessageService,
  ) {}

ngOnInit(): void {
  this.homeService.getDetails().subscribe({
    next: (data) => {
      this.detailsData = data;
    },
    error: (err) =>
      this.messageService.add({ severity: 'error', summary: 'Error', detail: err }),
  });

  this.isDetailsPage = this.router.url.includes('chardetails');

  this.router.events
    .pipe(filter((e) => e instanceof NavigationEnd))
    .subscribe(() => {
      this.isDetailsPage = this.router.url.includes('chardetails');
    });
}


  goToDetails(item: any, index: number) {
    const encodedId = btoa(JSON.stringify({ index, uid: uuidv4(), time: Date.now() }));
    this.router.navigate(['/home/chardetails', encodedId]);
  }
}
