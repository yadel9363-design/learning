import { Component, ElementRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
  newTitle: string = '';
  newCourses: { name: string, saved: boolean }[] = [];
  isAdmin: boolean = false;

  @Input() set coursesAdmin(value: any) {
    this.courses = value;
  }

  private courseService = inject(CourseService);
  private userService = inject(UserService);

  @ViewChild('titleInput') titleInput!: ElementRef;

  ngOnInit() {
    this.loadCourses();
    this.checkIfAdmin();
  }

  loadCourses() {
    this.courseService.getCourses().pipe(take(1)).subscribe(data => {
      this.courses = data;
      console.log('Courses loaded:', this.courses);
    });
  }

openEditDialog(category: any) {
  console.log('Editing category:', category); // <== تحقق هل يصل هنا

  this.selectedCategory = category;
  this.newTitle = category.key;

  this.newCourses = (category.value || []).map((course: string) => ({
    name: course,
    saved: true
  }));

  console.log('newCourses:', this.newCourses); // <== تحقق من البيانات

  this.isEditDialogVisible = true;
}

  deleteCourse(index: number) {
    this.newCourses.splice(index, 1);
  }
trackByIndex(index: number): number {
  return index;
}

addCourse() {
  this.newCourses.push({ name: '', saved: false });
}

CheckIsValid(){
  return !this.newCourses.some(course => !course.saved && course.name.trim().length > 0);
}

saveUpdatedCategory() {
  if (!this.newTitle.trim()) return;

  this.courseService.updateCategory(this.selectedCategory.key, {
    key: this.newTitle,
    value: this.newCourses.map(c => c.name)
  }).then(() => {
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
