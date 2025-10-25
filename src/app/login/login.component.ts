import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  NgZone,
  EnvironmentInjector,
  runInInjectionContext,
  ChangeDetectorRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FocusTrapModule } from 'primeng/focustrap';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { AutoFocusModule } from 'primeng/autofocus';
import { PasswordModule } from 'primeng/password';
import { Auth, GoogleAuthProvider, signInWithPopup, signInWithCredential, User } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { authState } from '@angular/fire/auth';
import { AuthService } from '../shared/services/auth.service';
import { UserService } from '../shared/services/user.service';
import { UniquenessValidator } from '../shared/DTO/unique.validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    ButtonModule,
    ProgressSpinnerModule,
    FocusTrapModule,
    IconFieldModule,
    InputIconModule,
    AutoFocusModule,
    ToggleButtonModule,
    ToastModule,
    PasswordModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @Output() loginSuccess = new EventEmitter<boolean>();

  user: User | null = null;
  errorMessage: string | null = null;
  showInterests = false;
  isLoadingCategories = false;
  categories: string[] = [];
  categoryStates: { [key: string]: boolean } = {};
  selectedCategories: string[] = [];

  loginForm = new FormGroup({
    Email: new FormControl('', [Validators.required, Validators.email], UniquenessValidator.CheckUniqueValidator),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });

  constructor(
    private router: Router,
    private zone: NgZone,
    private auth: Auth,
    private firestore: Firestore,
    private authService: AuthService,
    private userService: UserService,
    private messageService: MessageService,
    private injector: EnvironmentInjector,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

ngOnInit() {

  if (isPlatformBrowser(this.platformId)) {
    // ✅ الكود اللي بيتعامل مع localStorage
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      this.zone.run(() => this.router.navigateByUrl('/home'));
      return;
    }
  }

  runInInjectionContext(this.injector, () => {
    authState(this.auth).subscribe(async (user) => {
      this.zone.run(async () => {
        if (user) {
          console.log('✅ Logged in user:', user);
          this.user = user;
          this.cd.detectChanges();
        } else {
          this.user = null;
          this.cd.detectChanges();
        }
      });
    });
  });
}

  getControl(name: string) {
    return this.loginForm.get(name);
  }

  getErrorMessage(name: string): string {
    const control = this.getControl(name);
    if (control?.hasError('required')) return `${name} is required`;
    if (control?.hasError('email')) return 'Invalid email format';
    if (control?.hasError('minlength'))
      return `${name} must be at least ${control.errors?.['minlength'].requiredLength} characters`;
    return '';
  }

  /** ✅ تسجيل الدخول بالبريد */
  async submit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { Email, password } = this.loginForm.value;
    try {
      const user = await this.authService.loginWithEmail(Email!, password!);
      this.user = user;

        localStorage.setItem('user', JSON.stringify(user));
        this.zone.run(() => this.router.navigateByUrl('/home'));

      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Login successful',
        styleClass: 'custom-cloud-toast'
       });
    } catch (error: any) {
      let message = 'Something went wrong';
      if (error?.code === 'auth/invalid-credential') message = 'Invalid email or password';
      this.errorMessage = message;
      this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
    }
  }

  /** ✅ تسجيل الدخول باستخدام Google */
async signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(this.auth, provider);
  const user = result.user;

  // ✅ هنا خزن التوكن الحقيقي اللي من Google
  const credential = GoogleAuthProvider.credentialFromResult(result);
  const idToken = credential?.idToken;

  if (idToken) {
    localStorage.setItem('googleIdToken', idToken);
  }

  const isFirstTime = await this.authService.isFirstTimeUser(user.uid);

  if (isFirstTime) {
    this.showInterests = true;
    localStorage.setItem('tempGoogleUser', JSON.stringify(user));
    await this.loadCategories();
    await this.auth.signOut();
  } else {
    this.authService.setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    this.zone.run(() => this.router.navigateByUrl('/home'));
  }
}



  /** ✅ حفظ الاهتمامات وإنهاء التسجيل */
async completeInterests() {
  const tempUser = JSON.parse(localStorage.getItem('tempGoogleUser') || '{}');
    const idToken = localStorage.getItem('googleIdToken');
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(this.auth, credential);


  if (!tempUser?.uid || !idToken) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Please sign in again.' });
    return;
  }

  try {
    // ✅ تسجيل دخول مؤقت لتفعيل request.auth.uid
    const credential = GoogleAuthProvider.credential(idToken);
    const result = await signInWithCredential(this.auth, credential);
    const loggedUser = result.user;

    // ✅ الآن المستخدم موثّق → نقدر نكتب في Firestore
    const userRef = doc(this.firestore, 'users', loggedUser.uid);
    await setDoc(
      userRef,
      {
        uid: loggedUser.uid,
        email: loggedUser.email,
        displayName: loggedUser.displayName,
        photoURL: loggedUser.photoURL,
        interests: this.selectedCategories,
        providerId: loggedUser.providerData?.[0]?.providerId || 'google.com',
        isAdmin: false,
      },
      { merge: true }
    );

    // ✅ تخزين البيانات محليًا
    localStorage.setItem('user', JSON.stringify(loggedUser));
    localStorage.removeItem('tempGoogleUser');
    localStorage.removeItem('googleIdToken');

    this.showInterests = false;

    this.messageService.add({
      severity: 'success',
      summary: 'Done!',
      detail: 'Your interests were saved successfully 🎉',
    });

    this.zone.run(() => this.router.navigateByUrl('/home'));
  } catch (error) {
    console.error('🔥 Error saving user interests:', error);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save your interests. Please try again.',
    });
  }
}

  logout() {
    this.auth.signOut().then(() => {
      localStorage.clear();
      this.showInterests = false;
      this.user = null;
      this.zone.run(() => this.router.navigateByUrl('/login'));
    });
  }

  onCategoryChange(category: string) {
    if (this.categoryStates[category]) {
      if (!this.selectedCategories.includes(category)) this.selectedCategories.push(category);
    } else {
      this.selectedCategories = this.selectedCategories.filter((c) => c !== category);
    }
  }

  RedirectToRegister() {
    this.router.navigateByUrl('/register');
  }

  /** ✅ تحميل التصنيفات */
  async loadCategories() {
    return runInInjectionContext(this.injector, async () => {
      try {
        this.isLoadingCategories = true;
        const refDoc = doc(this.firestore, 'categories', 'Courses');
        const docSnap = await getDoc(refDoc);

        if (!docSnap.exists()) {
          console.error('❌ No categories found in Firestore');
          this.categories = [];
        } else {
          const data = docSnap.data();
          this.categories = Object.keys(data || {});
          this.categories.forEach((cat) => (this.categoryStates[cat] = false));
        }
      } catch (err) {
        console.error('❌ Error loading categories:', err);
        this.categories = [];
      } finally {
        this.isLoadingCategories = false;
        this.cd.detectChanges();
      }
    });
  }
}
