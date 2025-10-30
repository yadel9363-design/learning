import { Component, OnInit } from '@angular/core';
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
    // لو موجود بس مافيش interests نضيفها
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
