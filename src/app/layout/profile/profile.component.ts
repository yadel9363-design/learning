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


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,
    ButtonModule,
    DialogModule,
    ImageCropperComponent,
    FormsModule,
    RadioButtonModule
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
  showCropper = false;
  imageChangedEvent: any = '';
  croppedImage: string | null = null;
  loading = false;
  phoneNumber: string = '';
  genderInput: string = '';
  phoneInput: string = '';
  gender: string = '';

  private db = inject(Database);
  private auth = inject(Auth);
  private storage = inject(Storage);
  private injector = inject(EnvironmentInjector);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  async ngOnInit(): Promise<void> {
    // ✅ راقب المستخدم الحالي مباشرة من AuthService
    this.authService.user$.subscribe(async (user) => {
      if (user) {
        this.username = user;
        this.photoURL = user.photoURL ?? undefined;

        // ✅ اجلب بياناته من DB لتحديث الهاتف وغيره
        const dbUser = await this.userService.getUserById(user.uid);
        if (dbUser?.phoneNumber) this.phoneNumber = dbUser.phoneNumber;
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

  // ✅ اختيار صورة جديدة
  onFileChange(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;

    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  // ✅ عند القص
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

  // ✅ رفع الصورة الجديدة إلى Storage
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

      // ✅ تحديث محلي مباشر
      this.gender = this.genderInput;
      this.phoneNumber = this.phoneInput;

      // ✅ إعادة تحميل بيانات المستخدم من AuthService
      await this.authService.refreshUserData();

      this.genderInput = '';
      this.phoneInput = '';
      alert('✅ Saved successfully!');
    } catch (err) {
      console.error('❌ Error saving extra info:', err);
      alert('Error saving info. Please try again.');
    } finally {
      this.loading = false;
    }
  }
}
