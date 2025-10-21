import { Component, EnvironmentInjector, runInInjectionContext, OnInit, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PasswordModule } from 'primeng/password';
import { StepperModule } from 'primeng/stepper';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { Firestore, collection, collectionData, doc, docData } from '@angular/fire/firestore';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    AutoCompleteModule,
    PasswordModule,
    StepperModule,
    ToggleButtonModule,
    FormsModule,
    ToastModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  categories: string[] = [];
  selectedCategories: string[] = [];
  categoryStates: { [key: string]: boolean } = {};

  genderOptions = ['Male', 'Female'];
  filteredGenders: string[] = [];

  activeStep = 1;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private firestore: Firestore,
    private injector: EnvironmentInjector,
    private messageService: MessageService,
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^[A-Z](?=.*\d)(?=.*[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]).+$/)
        ]
      ],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      gender: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

loadCategories() {
  runInInjectionContext(this.injector, async () => {
    const ref = doc(this.firestore, 'categories', 'Courses');
    docData(ref).subscribe((snap: any) => {
      if (snap) {
        this.categories = Object.keys(snap);
        this.categories.forEach(cat => (this.categoryStates[cat] = false));
        this.cd.detectChanges();
        console.log('✅ Categories loaded:', this.categories);
      } else {
        console.log('⚠️ No data found in categories/Courses');
      }
    });
  });
}


  activateStep(step: number) {
    this.errorMessage = null;
    this.activeStep = step;
  }

  filterGender(event: any) {
    const query = event.query.toLowerCase();
    this.filteredGenders = this.genderOptions.filter(g =>
      g.toLowerCase().includes(query)
    );
  }

  async register(event?: Event) {
    if (event) event.preventDefault();

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { displayName, email, password, phoneNumber, gender } = this.registerForm.value;
    this.loading = true;

    try {
      await this.authService.registerWithEmail(
        email,
        password,
        displayName,
        phoneNumber,
        gender,
        this.selectedCategories
      );

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Account created successfully',
      });

      setTimeout(() => this.router.navigateByUrl('/home'), 1500);

    } catch (error: any) {
      let message = 'Something went wrong';
      if (error?.code === 'auth/email-already-in-use') {
        message = 'This account already exists';
      }

      this.errorMessage = message;
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: message
      });
    } finally {
      this.loading = false;
    }
  }

  onCategoryChange(category: string) {
    if (this.categoryStates[category]) {
      if (!this.selectedCategories.includes(category)) {
        this.selectedCategories.push(category);
      }
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    }
  }

  GoToLogin(event?: Event) {
    if (event) event.preventDefault();
    this.router.navigateByUrl('/login');
  }
}
