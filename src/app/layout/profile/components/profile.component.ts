import { Component, OnInit, inject, EnvironmentInjector, runInInjectionContext, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { Auth, updateProfile, User } from '@angular/fire/auth';
import { Storage, ref as storageRef, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Database } from '@angular/fire/database';
import { UserService } from '../../../shared/services/user.service';
import { AuthService } from '../../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';
import { HttpClient } from '@angular/common/http';
import { AppUser } from '../../../shared/DTO/user.model';
import { AnimateOnScrollModule } from 'primeng/animateonscroll';
import { AccordionModule } from 'primeng/accordion';
import { FloatingCustomersComponent } from '../floating-customers/floating-customers.component';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    DialogModule,
    ImageCropperComponent,
    FormsModule,
    RadioButtonModule,
    InputMaskModule,
    AnimateOnScrollModule,
    AccordionModule,
    FloatingCustomersComponent,
    ToggleButtonModule,
    ProgressSpinnerModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  photoURL?: string;
  user: User | null = null;
  username: AppUser | null = null;
  imageChangedEvent: any = '';
  croppedImage: string | null = null;
  phoneNumber = '';
  userName = '';
  emailText = '';
  gender = '';
  usernameInput = '';
  genderEditInput = '';
  newInterest = '';
  PhoneEditInput = '';
  EmailEditInput = '';
  genderInput = '';
  phoneInput = '';
  hideLinkTimeout: any;
  currentImage = 'https://cdn.dribbble.com/users/347174/screenshots/2958807/charlie-loader.gif';
  selectedFile: File | null = null;
  selectedTab: 'profile' | 'contact' = 'profile';
  categories: string[] = [];
  categoryStates: { [key: string]: boolean } = {};

  showCropper = false;
  loading = false;
  isEditingGender = false;
  isEditingPhoneNumber = false;
  isEditingEmail = false;
  isEditingUsername = false;
  showSetNewImageMsg = false;
  isPhoneValid = false;
  isEmailValid = false;
  showCropperDialog = false;
  isCropping = false;
  loadingImage = false;
  private isUploading = false;
  isEditingInterests = false;
  isLoadingCategories = false;


  private db = inject(Database);
  private auth = inject(Auth);
  private storage = inject(Storage);
  private injector = inject(EnvironmentInjector);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);
  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);
  private firestore = inject(Firestore);

  boxs=[
    {
      count: '+20',
      label: 'years of experience'
    },
    {
      count: '+10K',
      label: '10,000 successful projects.'
    },
    {
      count: '99%',
      label: '99% customer satisfaction.'
    },
    {
      count: '+15',
      label: 'over 15 awards.'
    }
  ]
    myCustomerList = [
    {
      name: 'Trimzales',
      icon: 'fa-solid fa-meteor'
    },
    {
      name: 'ZenTrailMs',
      icon: 'fa-solid fa-bolt'
    },
    {
      name: 'BriteMank',
      icon: 'fa-solid fa-fire'
    },
    // ضيف العملاء الباقيين هنا
  ];

async ngOnInit(): Promise<void> {
  this.authService.user$.subscribe(async (user) => {
    this.user = user || null;
    console.log('user', user)
    if (user) {
      const dbUser = await this.userService.getUserById(user.uid);
      this.username = dbUser ? { ...user, ...dbUser } : user;
      this.showLoadingThenFallback();
      this.loadCategories();
    } else {
      this.username = null;
    }
    this.cdr.detectChanges();
  });

  this.userService.getCurrentUserData().subscribe((user) => {
    if (user?.isAdmin) this.userService.updateOldUsers();
  });
}

  onPhoneComplete() { this.isPhoneValid = true; }
  onPhoneInput() { this.isPhoneValid = (this.PhoneEditInput || '').replace(/\D/g, '').length === 11; }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || !input.files[0]) return;

    this.selectedFile = input.files[0];
    this.croppedImage = null;
    this.isCropping = false;
    this.showCropperDialog = true;
    this.imageChangedEvent = event;
  }

  cancelCrop() {
    this.showCropperDialog = false;
    this.isCropping = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
    this.selectedFile = null;
    const inputElement = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (inputElement) inputElement.value = '';
  }

  startCrop() { this.isCropping = true; }

imageCropped(event: ImageCroppedEvent) {
  console.log('imageCropped event:', event);

  if (event.blob) {
    const reader = new FileReader();
    reader.readAsDataURL(event.blob);
    reader.onload = () => {
      this.zone.run(() => {
        this.croppedImage = reader.result as string;
        console.log('croppedImage set:', this.croppedImage?.substring(0,30));
      });
    };
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      this.croppedImage = null;
    };
  } else {
    this.croppedImage = null;
  }
}


// عند فشل تحميل الصورة
async showLoadingThenFallback() {
  // أولًا: اعرض اللودر
  this.currentImage = 'https://cdn.dribbble.com/users/347174/screenshots/2958807/charlie-loader.gif';

  await new Promise(resolve => setTimeout(resolve, 3000));

  if (!this.photoURL) {
    this.currentImage = 'assets/images/img4.png';
  } else {
    this.currentImage = this.photoURL;
  }
}


// ✅ لو الصورة فشلت في التحميل لأي سبب
onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = 'assets/images/img4.png';
  img.onerror = null;
}
// عند رفع الصورة
async saveCroppedImage() {
  if (!this.username || !this.croppedImage) return;
  if (this.isUploading) return;
  this.isUploading = true;
  this.loading = true;
  this.loadingImage = true;

  try {
    const imageRef = storageRef(this.storage, `profilePhotos/${this.username.uid}_${Date.now()}.png`);
    await uploadString(imageRef, this.croppedImage!, 'data_url');
    const url = await getDownloadURL(imageRef);

    await updateProfile(this.user!, { photoURL: url });
    await this.userService.updateUser(this.username!.uid, { photoURL: url });
    await this.authService.refreshUserData();

    this.zone.run(() => {
      this.photoURL = `${url}&t=${Date.now()}`;
      this.showCropperDialog = false;
      this.selectedFile = null;
      this.croppedImage = null;
      this.loadingImage = false;
    });

    this.messageService.add({
      severity: 'success',
      summary: 'Uploaded',
      detail: 'Profile photo updated successfully!'
    });
  } catch (err) {
    console.error('Upload error:', err);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to upload image.'
    });
  } finally {
    this.isUploading = false; // ✅ إعادة الضبط
    this.loading = false;
  }
}



async saveImageDirectly(file: File | null) {
  if (!file || !this.username) return;
  this.loading = true;

  try {
    // تحويل الصورة إلى Base64
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
      reader.readAsDataURL(file);
    });

    const imageRef = storageRef(this.storage, `profilePhotos/${this.username.uid}_${Date.now()}.png`);

    // رفع الصورة
    await runInInjectionContext(this.injector, () =>
      uploadString(imageRef, base64, 'data_url')
    );

    // جلب رابط الصورة
    const url = await runInInjectionContext(this.injector, () =>
      getDownloadURL(imageRef)
    );

    // تحديث بيانات المستخدم في Firebase Auth و Database
    await runInInjectionContext(this.injector, async () => {
      await updateProfile(this.user!, { photoURL: url });
      await this.userService.updateUser(this.username!.uid, { photoURL: url });
      await this.authService.refreshUserData();
    });

    // عرض الصورة مباشرة
    this.zone.run(() => {
      this.photoURL = url; // تعيين الرابط الجديد
      this.showCropperDialog = false;
      this.selectedFile = null;
    });

    // تحديث عنصر الصورة مباشرة في الـ DOM لتجنب الـ cache
    const imgElement = document.querySelector<HTMLImageElement>('.avatar');
    if (imgElement) {
      imgElement.src = ''; // اجبر على إعادة التحميل
      setTimeout(() => imgElement.src = this.photoURL || 'assets/images/img4.png', 50);
    }

    // إعادة تعيين input type file
    const inputElement = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (inputElement) inputElement.value = '';

    this.messageService.add({
      severity: 'success',
      summary: 'Uploaded',
      detail: 'Profile photo updated successfully!'
    });
  } catch (err) {
    console.error('Upload error:', err);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to upload image.'
    });
  } finally {
    this.loading = false;
  }
}

  async saveExtraInfo() {
  if (!this.username || (!this.genderInput && !this.phoneInput)) return;

  this.loading = true;
  const uid = this.username.uid;

  try {
    const dataToUpdate: any = {};
    if (this.genderInput) dataToUpdate.gender = this.genderInput;
    if (this.phoneInput) dataToUpdate.phoneNumber = this.phoneInput;

    await this.userService.updateUser(uid, dataToUpdate);

    this.gender = this.genderInput;
    this.phoneNumber = this.phoneInput;

    // ✅ إعادة تحميل بيانات المستخدم من AuthService
    await this.authService.refreshUserData();

    this.genderInput = '';
    this.phoneInput = '';
    this.messageService.add({ severity: 'success', summary: 'Success', detail: '✅ Saved successfully' });
  } catch (err) {
    console.error('❌ Error saving extra info:', err);
    this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Error saving info, Please try again.' });
  } finally {
    this.loading = false;
  }
}

  startEditGender() {
  this.isEditingGender = true;
  this.genderEditInput = this.username?.gender || this.gender || '';
  }
  cancelEditGender() {
  this.isEditingGender = false;
  this.genderEditInput = '';
  }
  async saveGenderEdit() {
  if (!this.username || !this.genderEditInput) return;
  this.loading = true;

  try {
    await this.userService.updateUser(this.username.uid, {
      gender: this.genderEditInput,
    });
    this.gender = this.genderEditInput;
    if (this.username) (this.username as any).gender = this.genderEditInput;

    await this.authService.refreshUserData();

    this.isEditingGender = false;
    this.messageService.add({ severity: 'success', summary: 'Success', detail: '🚻 gender updated Successfully' });
  } catch (err) {
    console.error('❌ Error updating gender:', err);
    this.messageService.add({ severity: 'danger', summary: 'danger', detail: 'Error updating gender, Please try again.' });
  } finally {
    this.loading = false;
  }
  }

  startEditPhoneNumber() {
  this.isEditingPhoneNumber = true;
  this.PhoneEditInput = this.username?.phoneNumber || this.phoneNumber || '';
  }
  CancelEditPhoneNumber() {
  this.isEditingPhoneNumber = false;
  this.PhoneEditInput = '';
  }
async savePhoneEdit() {
  if (!this.username || !this.PhoneEditInput || !this.isPhoneValid) return;
  this.loading = true;

  try {
    const cleanPhone = this.PhoneEditInput.replace(/\D/g, '');

    await this.userService.updateUser(this.username.uid, {
      phoneNumber: cleanPhone,
    });

    this.phoneNumber = cleanPhone;
    if (this.username) (this.username as any).phoneNumber = cleanPhone;

    await this.authService.refreshUserData();

    this.isEditingPhoneNumber = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: '📱 Phone number updated successfully',
    });
  } catch (err) {
    console.error('❌ Error updating phone number:', err);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error updating phone number, please try again.',
    });
  } finally {
    this.loading = false;
  }
}


  startEditEmail() {
  this.isEditingEmail = true;
  this.EmailEditInput = this.username?.email || this.emailText || '';
  }
  CancelEditEmail() {
  this.isEditingEmail = false;
  this.EmailEditInput = '';
  }

  validateEmail() {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.isEmailValid = emailPattern.test(this.EmailEditInput || '');
  }

  async saveEmailEdit() {
    if (!this.username || !this.EmailEditInput || !this.isEmailValid) return;
    this.loading = true;

    try {
      await this.userService.updateUser(this.username.uid, {
        email: this.EmailEditInput,
      });

      this.emailText = this.EmailEditInput;
      if (this.username) (this.username as any).emailText = this.EmailEditInput;

      await this.authService.refreshUserData();

      this.isEditingEmail = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: '📧 Email updated successfully',
      });
    } catch (err) {
      console.error('❌ Error updating Email:', err);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Error updating Email, please try again.',
      });
    } finally {
      this.loading = false;
    }
  }

  startEditUsername() {
  this.isEditingUsername = true;
  this.usernameInput = this.username?.displayName || this.userName || '';
  }
  CancelEditUsername() {
  this.isEditingUsername = false;
  this.usernameInput = '';
  }
  async saveUsernameEdit() {
  if (!this.username || !this.usernameInput) return;
  this.loading = true;

  try {
    await this.userService.updateUser(this.username.uid, {
      displayName: this.usernameInput,
    });

    this.userName = this.usernameInput;
    if (this.username) (this.username as any).userName = this.usernameInput;

    await this.authService.refreshUserData();

    this.isEditingUsername = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: '👤 username updated successfully',
    });
  } catch (err) {
    console.error('❌ Error updating Email:', err);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Error updating Email, please try again.',
    });
  } finally {
    this.loading = false;
  }
  }

startEditInterests() {
  this.isEditingInterests = true;
}
cancelEditInterests() {
  this.isEditingInterests = false;
}


async loadCategories() {
  return runInInjectionContext(this.injector, async () => {
    try {
      this.isLoadingCategories = true;
      const refDoc = doc(this.firestore, 'categories', 'Courses');
      const docSnap = await getDoc(refDoc);

      if (docSnap.exists()) {
        const data = docSnap.data();
        this.categories = Object.keys(data || {});

        // ✅ تفعيل التصنيفات اللي المستخدم مختارها بالفعل
        this.categories.forEach(
          (cat) => (this.categoryStates[cat] = this.username?.interests?.includes(cat) || false)
        );
      } else {
        this.categories = [];
        console.warn('⚠️ No categories found.');
      }
    } catch (err) {
      console.error('❌ Error loading categories:', err);
      this.categories = [];
    } finally {
      this.isLoadingCategories = false;
      this.cdr.detectChanges();
    }
  });
}

onCategoryChange(category: string, isSelected: boolean) {
  this.categoryStates[category] = isSelected;

  // تحديث القيمة محلياً
  const selected = Object.keys(this.categoryStates).filter((c) => this.categoryStates[c]);
  this.username!.interests = [...selected];
  this.cdr.detectChanges();
}

async saveInterests() {
  if (!this.username) return;

  const selected = Object.keys(this.categoryStates).filter((c) => this.categoryStates[c]);

  try {
    await this.userService.updateUser(this.username.uid, { interests: selected });

    // ✅ تحديث القيمه محلياً
    this.username.interests = [...selected];
    this.isEditingInterests = false;
    this.cdr.detectChanges();

    this.messageService.add({
      severity: 'success',
      summary: 'Updated',
      detail: '🎯 Interests saved successfully!',
    });
  } catch (err) {
    console.error('❌ Error saving interests:', err);
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save interests. Please try again.',
    });
  }
}


}
