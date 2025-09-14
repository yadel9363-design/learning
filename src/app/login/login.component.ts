import { Component, EventEmitter, OnInit, Output, inject, NgZone } from '@angular/core';
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

import {
  Auth,
  signInWithRedirect,
  GoogleAuthProvider,
  getRedirectResult,
  UserCredential,
  signInWithPopup
} from '@angular/fire/auth';

import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

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
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService],
})
export class LoginComponent implements OnInit {

  @Output() loginSuccess = new EventEmitter<boolean>();

  loginForm = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.email], UniquenessValidator.CheckUniqueValidator),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  constructor(private auth: Auth,private router:Router, private zone: NgZone,
    private messageService: MessageService
   ){

  }

ngOnInit() {
  this.zone.run(() => {
    getRedirectResult(this.auth)
      .then((result: UserCredential | null) => {
        if (result?.user || this.auth.currentUser) {
          this.router.navigate(['/products']);
        } else {
          this.messageService.add({
            severity: 'info',
            summary: 'No User',
            detail: 'No user signed in',
            life: 3000
          });
        }
      })
      .catch((error) => {
        console.error('Redirect error:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Login Error',
          detail: error.message || 'Error during login',
          life: 3000
        });
      });
  });
}

  submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    console.log('📨 Manual login data:', this.loginForm.value);
    // يمكنك إضافة منطق تسجيل الدخول اليدوي هنا إذا لزم
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

signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  signInWithPopup(this.auth, provider)
    .then((result) => {
      if (result.user) {
        this.zone.run(() => this.router.navigate(['/products']));
        this.messageService.add({
          severity: 'success',
          summary: 'Welcome',
          detail: `Logged in as ${result.user.email}`,
          life: 3000
        });
      }
    })
    .catch((error) => {
      console.error('Popup login error:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Login Failed',
        detail: error.message || 'Popup login error',
        life: 3000
      });
    });
}

}
