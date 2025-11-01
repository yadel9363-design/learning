import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { homeService } from '../service/home.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { v4 as uuidv4 } from 'uuid';
import { MessageModule } from 'primeng/message';
import { DialogModule } from 'primeng/dialog';
import { UserService } from '../../../shared/services/user.service';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AuthService } from '../../../shared/services/auth.service';
import { UniquenessValidator } from '../../../shared/DTO/unique.validators';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ref, get } from '@angular/fire/database';
import { Carousel, CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ChartModule,
    ButtonModule,
    RouterModule,
    ProgressSpinnerModule,
    ToastModule,
    MessageModule,
    DialogModule,
    FormsModule,
    ReactiveFormsModule,
    IconFieldModule,
    InputIconModule,
    CarouselModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  detailsData: any = {};
  isDetailsPage = false;
  checkFoundUser: any;
  nowText = 'NOW';
  dockText = `Stop searching for everything. <span class="now-text">${this.nowText}</span> Get access to get offer.`;
  showOffer = false;
  offerClaimed: boolean | null = null;

  testimonials = [
    {
      title: 'Great Experience',
      text: `We’ve been able to scale operations effortlessly thanks to the intuitive dashboards and the helpful support team.`,
      author: 'Anna White',
      role: 'Operations Lead at Softly',
      img: 'assets/images/SS.webp',
    },
    {
      title: 'Outstanding Customer Support',
      text: `The customer support team is always responsive and helpful. The detailed spending reports have given us great insights into our financial health.`,
      author: 'Sophia Lee',
      role: 'CFO at GreenTech',
      img: 'assets/images/SS3.webp',
    },
    {
      title: 'Exceptional Service and Reliability',
      text: `Using this SaaS platform has significantly streamlined our operations. The real-time collaboration and dashboards have been game changers.`,
      author: 'Emily Johnson',
      role: 'Marketing Manager at TechCorp',
      img: 'assets/images/SS2.jpg',
    },
  ];

  currentIndex = 1; // الكارت الأوسط (المفعّل)

  getCardClass(i: number): string {
    if (i === this.currentIndex) return 'active';
    if (i === this.getLeftIndex()) return 'faded-left';
    if (i === this.getRightIndex()) return 'faded-right';
    return 'hidden';
  }

  getLeftIndex(): number {
    return (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }

  getRightIndex(): number {
    return (this.currentIndex + 1) % this.testimonials.length;
  }

  next() {
    this.currentIndex = (this.currentIndex + 1) % this.testimonials.length;
  }

  prev() {
    this.currentIndex =
      (this.currentIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }


  userForm = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.email], UniquenessValidator.CheckUniqueValidator)
  });

  constructor(
    private router: Router,
    private homeService: homeService,
    private messageService: MessageService,
    private userService: UserService,
    private authService: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    this.checkUser();
    this.loadData();
  }

  openOffer() {
    this.showOffer = true;
  }

  loadData() {
    this.homeService.getDetails().subscribe({
      next: (data) => {
        this.detailsData = data;
        this.isDetailsPage = this.router.url.includes('chardetails');

        this.router.events
          .pipe(filter((e) => e instanceof NavigationEnd))
          .subscribe(() => {
            this.isDetailsPage = this.router.url.includes('chardetails');
          });
      },
      error: (err) =>
        this.messageService.add({ severity: 'error', summary: 'Error', detail: err }),
    });
  }

  goToDetails(item: any, index: number) {
    const encodedId = btoa(JSON.stringify({ index, uid: uuidv4(), time: Date.now() }));
    this.router.navigate(['/home/chardetails', encodedId]);
  }

async checkUser() {
  const authUser = await new Promise<any>((resolve) => {
    const unsub = this.authService['auth'].onAuthStateChanged((u) => {
      resolve(u);
      unsub();
    });
  });

  if (!authUser) return;

  let u = await this.userService.getUserById(authUser.uid);

  if (!u) {
    const newUserData = {
      uid: authUser.uid,
      email: authUser.email || '',
      displayName: authUser.displayName || '',
      photoURL: authUser.photoURL || '',
      providerId: authUser.providerData?.[0]?.providerId || 'unknown',
      isAdmin: false,
      phoneNumber: '',
      gender: '',
      interests: authUser.interests || [],
      offerClaimed: false,
    };
    await this.userService.save(newUserData);
    u = await this.userService.getUserById(authUser.uid);
  } else {

    if (!u.interests || !Array.isArray(u.interests)) {
      await this.userService.updateUser(authUser.uid, { interests: authUser.interests || [] });
      u.interests = authUser.interests || [];
    }
  }

  this.checkFoundUser = u;

  if (u?.email) {
    this.userForm.get('Email')?.setValue(u.email);
    this.userForm.get('Email')?.disable();
  }

  this.offerClaimed = u?.offerClaimed ?? false;
}

  async submit() {
    this.showOffer = false;
    this.offerClaimed = true;

    if (!this.checkFoundUser) return;

    const userRef = ref(this.userService['db'], `users/${this.checkFoundUser.uid}`);
    const snapshot = await get(userRef);

    if (snapshot.exists()) {
      // المستخدم موجود → تحديث offerClaimed فقط
      await this.userService.updateUser(this.checkFoundUser.uid, { offerClaimed: true });
    } else {
      // المستخدم مش موجود → إنشاء كامل البيانات مع interests
      const newUserData = {
        uid: this.checkFoundUser.uid,
        email: this.checkFoundUser.email || '',
        displayName: this.checkFoundUser.displayName || '',
        photoURL: this.checkFoundUser.photoURL || '',
        providerId: this.checkFoundUser.providerId || 'unknown',
        isAdmin: false,
        phoneNumber: this.checkFoundUser.phoneNumber || '',
        gender: this.checkFoundUser.gender || '',
        interests: this.checkFoundUser.interests || [],
        offerClaimed: true,
      };
      await this.userService.save(newUserData);
    }

    this.router.navigate(['/courses']);
  }
}
