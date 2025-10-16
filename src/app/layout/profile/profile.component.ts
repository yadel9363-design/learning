import { Component, OnInit, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { Auth, updateProfile, User } from '@angular/fire/auth';
import { Storage, ref as storageRef, uploadString, getDownloadURL } from '@angular/fire/storage';
import { Database, ref as dbRef, update } from '@angular/fire/database';
import { UserService } from '../../shared/services/user.service';
import { AuthService } from '../../shared/services/auth.service';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';
import { MessageService } from 'primeng/api';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,
    ButtonModule,
    DialogModule,
    ImageCropperComponent,
    FormsModule,
    RadioButtonModule,
    InputMaskModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
Logout() {
throw new Error('Method not implemented.');
}
  photoURL?: string;
  username: User | null = null;
  imageChangedEvent: any = '';
  croppedImage: string | null = null;
  phoneNumber: string = '';
  userName: string = '';
  emailText: string = '';
  genderInput: string = '';
  phoneInput: string = '';
  gender: string = '';
  usernameInput: string = '';
  genderEditInput: string = '';
  PhoneEditInput: string = '';
  EmailEditInput: string = '';
  hideLinkTimeout: any;


  showCropper = false;
  loading = false;
  isEditingGender = false;
  isEditingPhoneNumber = false;
  isEditingEmail = false;
  isEditingUsername = false;
  showSetNewImageMsg = false;
  isPhoneValid = false;
  isEmailValid = false;

  private db = inject(Database);
  private auth = inject(Auth);
  private storage = inject(Storage);
  private injector = inject(EnvironmentInjector);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private messageService = inject(MessageService);



  async ngOnInit(): Promise<void> {
    // ✅ راقب المستخدم الحالي مباشرة من AuthService
this.authService.user$.subscribe(async (user) => {
  if (user) {
    this.username = user;
    this.photoURL = user.photoURL ?? undefined;

    // ✅ اجلب بياناته من DB لتحديث الهاتف وغيره
    const dbUser = await this.userService.getUserById(user.uid);

    if (dbUser?.phoneNumber) this.phoneNumber = dbUser.phoneNumber;
    if (dbUser?.gender) this.gender = dbUser.gender;
    if (dbUser?.email) this.emailText = dbUser.email;
    if (dbUser?.displayName) this.userName = dbUser.displayName;
  } else {
    this.username = null;
    this.photoURL = undefined;
  }
});

    // ✅ لو المستخدم admin
    this.userService.getCurrentUserData().subscribe((user) => {
      if (user?.isAdmin) this.userService.updateOldUsers();
    });
  }

  onPhoneComplete() {
    this.isPhoneValid = true;
  }

  onPhoneInput() {
  const value = this.PhoneEditInput || '';
  this.isPhoneValid = value.replace(/\D/g, '').length === 11;
}
  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.imageChangedEvent = event;
    this.showCropper = true;
  }
  imageCropped(event: ImageCroppedEvent) {
    if (event.base64) {
      this.croppedImage = event.base64;
    } else if (event.blob) {
      const reader = new FileReader();
      reader.onload = () => {
        this.croppedImage = reader.result as string;
      };
      reader.readAsDataURL(event.blob);
    } else {
      console.warn('⚠️ No image data returned from cropper', event);
    }
  }

  cancelCrop() {
    this.showCropper = false;
    this.imageChangedEvent = '';
    this.croppedImage = null;
  }
  async saveCroppedImage() {
    const user = this.auth.currentUser;
    if (!user) return console.warn('⚠️ No user logged in');
    if (!this.croppedImage) return console.warn('⚠️ No cropped image to upload!');

    const imageRef = storageRef(this.storage, `profilePhotos/${user.uid}.png`);
    this.loading = true;
    console.log('🟡 Starting upload for user:', user.uid);

    await runInInjectionContext(this.injector, async () => {
      try {
        await uploadString(imageRef, this.croppedImage!, 'data_url');
        const url = await getDownloadURL(imageRef);
        console.log('✅ Uploaded! URL:', url);

        // ✅ حدّث الصورة في Auth
        await updateProfile(user, { photoURL: url });

        // ✅ حدّث الصورة في قاعدة البيانات
        await this.userService.updateUser(user.uid, { photoURL: url });

        // ✅ حدّث البيانات في AuthService ليظهر فورًا في Navbar
        await this.authService.refreshUserData();

        this.photoURL = url;
        this.showCropper = false;
      } catch (err) {
        console.error('❌ Upload failed:', err);
      } finally {
        this.loading = false;
      }
    });
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
onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.src = img.alt;
  this.showSetNewImageMsg = false

  clearTimeout(this.hideLinkTimeout);
  this.hideLinkTimeout = setTimeout(() => {
    img.style.display = 'none';
    this.showSetNewImageMsg = true;
  }, 5000);
}
}
