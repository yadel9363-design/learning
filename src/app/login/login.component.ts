import { Component, EventEmitter, OnInit, Output, output } from '@angular/core';
import { FocusTrapModule } from 'primeng/focustrap';
import { ButtonModule } from 'primeng/button';
import { FormControl, FormGroup, FormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoFocusModule } from 'primeng/autofocus';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TextValidator } from '../shared/DTO/validators.validation';
import { UniquenessValidator } from '../shared/DTO/unique.validators';


@Component({
  selector: 'app-login',
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
  FormsModule
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit{
  loginForm = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.email], UniquenessValidator.CheckUniqueValidator),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    username: new FormControl('', [Validators.required, TextValidator.noSpaceAllowed], UniquenessValidator.CheckUniqueValidator)
  });


  @Output() loginSuccess = new EventEmitter<boolean>();

ngOnInit() {
}
  Islogin(){
    console.log('data', this.loginForm)
  }


  submit(f:any) {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.loginSuccess.emit();
  }

getControl(controlName: string) {
  return this.loginForm.get(controlName);    //controlName => (Email or password) from FormGroup
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
    return `${controlName} must not included any spaces`;
  }
  if (control?.hasError('existname')) {
   return `This ${controlName} is already taken`;
  }

  return '';
}

}
