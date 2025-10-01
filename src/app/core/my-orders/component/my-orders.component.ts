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
    TagModule
  ],
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  courses: any = {};
  selectedCategory: any = null;
  isEditDialogVisible: boolean = false;
  isAdmin: boolean = false;

  editForm!: FormGroup;

  private courseService = inject(CourseService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

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
      title: [{value: '', disabled: !this.isAdmin}, Validators.required],
      courses: this.fb.array([])
    });
  }

  get coursesArray(): FormArray {
    return this.editForm.get('courses') as FormArray;
  }

  loadCourses() {
    this.courseService.getCourses().pipe(take(1)).subscribe(data => {
      this.courses = data;
      console.log('Courses loaded:', this.courses);
    });
  }

  openEditDialog(category: any) {
    this.selectedCategory = category;

    this.editForm.reset();
    this.coursesArray.clear();

    // set values
    this.editForm.patchValue({ title : category.key });

    (category.value || []).forEach((course: string) => {
  const control = this.fb.control(
    { value: course, disabled: !this.isAdmin }, // لو مش admin disable
    Validators.required
  );
  (control as any).fromFirebase = true; // نحط علامة إنه من Firebase
  this.coursesArray.push(control);
    });


if (!this.isAdmin) {
  this.editForm.get('title')?.disable();
  this.coursesArray.controls.forEach(c => {
    if ((c as any).fromFirebase) {
      c.disable();   // disable فقط لو جاي من Firebase
    } else {
      c.enable();    // اللي مضاف جديد نخليه editable
    }
  });
} else {
  this.editForm.get('title')?.enable();
  this.coursesArray.controls.forEach(c => c.enable());
}



    this.isEditDialogVisible = true;
  }

addCourse() {
  const control = this.fb.control('', Validators.required);
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

  cancelEdit() {
    this.isEditDialogVisible = false;
    this.selectedCategory = null;
  }

  deleteCategoryFromDB(categoryKey: string) {
    this.courseService.deleteCategory(categoryKey).then(() => {
      delete this.courses[categoryKey];
      this.courses = { ...this.courses };
    });
  }

  checkIfAdmin() {
    this.userService.getCurrentUserData().pipe(take(1)).subscribe((userData: AppUser | null) => {
      if (userData?.isAdmin) {
        this.isAdmin = true;
      }
    });
  }
}
