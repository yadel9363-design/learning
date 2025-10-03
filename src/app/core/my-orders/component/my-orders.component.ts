import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TagModule } from 'primeng/tag';
import { CourseService } from '../service/course.service';
import { take } from 'rxjs/operators';
import { UserService } from '../../../shared/services/user.service';
import { AppUser } from '../../../shared/DTO/user.model';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-my-orders',
  standalone: true,
  imports: [
    ButtonModule,
    TableModule,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    TagModule,
    ToastModule
  ],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  courses: any = {};
  selectedCategory: any = null;
  isEditDialogVisible: boolean = false;
  isDeleteDialogVisible: boolean = false;
  isAdmin: boolean = false;

  editForm!: FormGroup;

  private courseService = inject(CourseService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  @Input() set coursesAdmin(value: any) {
    this.courses = value;
  }

  @ViewChild('titleInput') titleInput!: ElementRef;

  ngOnInit() {
    this.loadCourses();
    this.checkIfAdmin();
    this.initForm();
  }

  initForm() {
    this.editForm = this.fb.group({
      title: [{value: '', disabled: !this.isAdmin}, [Validators.required, this.noWhitespaceValidator]],
      courses: this.fb.array([])
    });
  }

  get coursesArray(): FormArray {
    return this.editForm.get('courses') as FormArray;
  }

  loadCourses() {
    this.courseService.getCourses().pipe(take(1)).subscribe(data => {
      this.courses = data;
    });
  }

openEditDialog(category: any) {
  this.selectedCategory = category;

  this.editForm.reset();
  this.coursesArray.clear();

  // set category title
  this.editForm.patchValue({ title: category.key });

  // لف على الكورسات (objects)
  (category.value?.value || []).forEach((course: any) => {
    const control = this.fb.control(
      { value: course.name, disabled: !this.isAdmin }, // خد course.name
      Validators.required
    );
    (control as any).fromFirebase = true;
    this.coursesArray.push(control);
  });

  // admin / user logic
  if (!this.isAdmin) {
    this.editForm.get('title')?.disable();
    this.coursesArray.controls.forEach(c => {
      if ((c as any).fromFirebase) {
        c.disable();
      } else {
        c.enable();
      }
    });
  } else {
    this.editForm.get('title')?.enable();
    this.coursesArray.controls.forEach(c => c.enable());
  }

  this.isEditDialogVisible = true;
}


addCourse() {
  const control = this.fb.control('', [Validators.required, this.noWhitespaceValidator]);
  (control as any).fromFirebase = false;
  this.coursesArray.push(control);
}


  deleteCourse(index: number) {
    this.coursesArray.removeAt(index);
  }

  saveUpdatedCategory() {
    if (this.editForm.invalid) return;

    const updated = {
      key: this.editForm.value.title,
      value: this.editForm.value.courses
    };

    this.courseService.updateCategory(this.selectedCategory.key, updated).then(() => {
      this.loadCourses();
      this.cancelEdit();
    });
  }

noWhitespaceValidator(control: any) {
  if (!control.value) return null;

  // لو كله مسافات
  if (control.value.trim().length === 0) {
    return { whitespace: true };
  }

  // لو بيبدأ أو ينتهي بمسافة
  if (control.value !== control.value.trim()) {
    return { leadingOrTrailingSpace: true };
  }

  return null;
}


  cancelEdit() {
    this.isEditDialogVisible = false;
    this.selectedCategory = null;
  }
  cancelDelete() {
    this.isDeleteDialogVisible = false;
    this.selectedCategory = null;
  }

  openDeleteCategoryFromDB(categoryKey: string) {
    this.isDeleteDialogVisible = true;
    this.selectedCategory = categoryKey;
  }

  deleteCategoryFromDB(categoryKey: string) {
    try {
      this.courseService.deleteCategory(categoryKey).then(() => {
      delete this.courses[categoryKey];
      this.courses = { ...this.courses };

        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: '✅ Category Deleted successfully'
        });

      this.cancelDelete();
    });
  } catch {
    this.messageService.add({
      severity: 'error',
      summary: 'error',
      detail: '❌ Error Delete Category'
    });

    }
  }

  checkIfAdmin() {
    this.userService.getCurrentUserData().pipe(take(1)).subscribe((userData: AppUser | null) => {
      if (userData?.isAdmin) {
        this.isAdmin = true;
      }
    });
  }
}
