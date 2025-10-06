import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    AutoCompleteModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  loading = false;

  genderOptions = ['Male', 'Female'];
  filteredGenders: string[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.registerForm = this.fb.group({
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9]{10,15}$/)]],
      gender: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  filterGender(event: any) {
    const query = event.query.toLowerCase();
    this.filteredGenders = this.genderOptions.filter(g =>
      g.toLowerCase().includes(query)
    );
  }

  async register() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { displayName, email, password, phoneNumber, gender } = this.registerForm.value;

    try {
      this.loading = true;
      const user = await this.authService.registerWithEmail(
        email,
        password,
        displayName,
        phoneNumber,
        gender
      );
      this.router.navigateByUrl('/home');
    } catch (error: any) {
      this.errorMessage = error.message;
    } finally {
      this.loading = false;
    }
  }

  GoToLogin() {
    this.router.navigateByUrl('/login');
  }
}
