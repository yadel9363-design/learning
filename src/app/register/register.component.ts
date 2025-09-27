import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { updateProfile } from 'firebase/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

async register() {
  if (this.registerForm.invalid) {
    this.registerForm.markAllAsTouched();
    return;
  }

  const { displayName, email, password } = this.registerForm.value;

  try {
    this.loading = true;

    // 🟢 ابعت displayName للـ service عشان يتسجل صح
    const user = await this.authService.registerWithEmail(email, password, displayName);

    console.log("🆕 Registered user:", user);
    this.router.navigateByUrl('/products');
  } catch (error: any) {
    this.errorMessage = error.message;
    console.error("❌ Register error:", error);
  } finally {
    this.loading = false;
  }
}
  GoToLogin() {
    this.router.navigateByUrl('/login');
  }
}
