import { Component, EventEmitter, OnInit, Output, inject, NgZone, Inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { FocusTrapModule } from 'primeng/focustrap';
import { ButtonModule } from 'primeng/button';
import { FormControl, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoFocusModule } from 'primeng/autofocus';
import { CommonModule } from '@angular/common';
import { UniquenessValidator } from '../shared/DTO/unique.validators';
import { ToastModule } from 'primeng/toast';
import { PLATFORM_ID } from '@angular/core';

import {
  Auth,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  UserCredential,
  signInWithPopup,
  User
} from '@angular/fire/auth';

import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    InputTextModule,
    ButtonModule,
    FocusTrapModule,
    FormsModule,
    CheckboxModule,
    IconFieldModule,
    InputIconModule,
    AutoFocusModule,
    CommonModule,
    ReactiveFormsModule,
    ToastModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent {

  @Output() loginSuccess = new EventEmitter<boolean>();

  user: User | null = null;

  loginForm = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.email], UniquenessValidator.CheckUniqueValidator),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  constructor(    private router: Router,
    private zone: NgZone,
    private auth: Auth,
    private authService: AuthService
   ){

  }

  async submit() {
  if (this.loginForm.invalid) {
    this.loginForm.markAllAsTouched();
    return;
  }

  const { Email, password } = this.loginForm.value;

  try {
    const user = await this.authService.loginWithEmail(Email!, password!);
    console.log("✅ Logged in user:", user);

    this.router.navigateByUrl('/products');
  } catch (error: any) {
    console.error("❌ Login error:", error.message);
  }
}

  getControl(controlName: string) {
    return this.loginForm.get(controlName);
  }

  getErrorMessage(controlName: string): string {
    const control = this.getControl(controlName);
    if (control?.hasError('required')) {
      return `${controlName} is required`;
    }
    if (control?.pending) {
      return `Checking ${controlName} in database...`;
    }
    if (control?.hasError('email')) {
      return 'Invalid email format';
    }
    if (control?.hasError('minlength')) {
      const requiredLength = control.getError('minlength').requiredLength;
      return `${controlName} must be at least ${requiredLength} characters`;
    }
    if (control?.hasError('noSpaceAllowed')) {
      return `${controlName} must not include any spaces`;
    }
    if (control?.hasError('existname')) {
      return `This ${controlName} is already taken`;
    }
    return '';
  }
async signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(this.auth, provider);

  this.zone.run(() => {
    this.user = result.user;

    // 1️⃣ ضبط الـ BehaviorSubject مباشرة
    this.authService.setUser(result.user);

    // 2️⃣ حفظ بيانات المستخدم في localStorage لتجنب إعادة التوجيه عند refresh
    localStorage.setItem('user', JSON.stringify(result.user));

    // 3️⃣ إعادة التوجيه بعد تسجيل الدخول
    const returnUrl = localStorage.getItem('returnUrl') || '/products';
    this.router.navigateByUrl(returnUrl);
    localStorage.removeItem('returnUrl');
  });
}

RedirectToRegister(){
    this.router.navigateByUrl('/register');
}
}
