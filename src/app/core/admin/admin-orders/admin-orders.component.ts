import { Component, inject, Input, OnInit } from '@angular/core';
import { MyOrdersComponent } from '../../my-orders/component/my-orders.component';
import { CourseService } from '../../my-orders/service/course.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [
    MyOrdersComponent,
    FormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    CommonModule
  ],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.scss']
})
export class AdminOrdersComponent implements OnInit {
  courses: any = {};
  newCategoryTitle: string = '';
  newCourses: string[] = [];
  isAddCategoryDialogVisible: boolean = false;

  private courseService = inject(CourseService);

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseService.getCourses().pipe(take(1)).subscribe(data => {
      this.courses = data || {};
    });
  }

  showAddCategoryDialog() {
    this.isAddCategoryDialogVisible = true;
    this.newCategoryTitle = '';
    this.newCourses = [''];
  }

  addNewCourse() {
    this.newCourses.push('');
  }

  deleteNewCourse(index: number) {
    this.newCourses.splice(index, 1);
  }

  isSaveDisabled(): boolean {
    if (!this.newCategoryTitle.trim()) {
      return true;
    }
    return this.newCourses.some(course => !course.trim());
  }

async saveNewCategory() {
  const category = this.newCategoryTitle.trim();
  if (!category) return;

  const filteredCourses = this.newCourses
    .map(c => c.trim())
    .filter(c => c.length > 0);

  try {
    await this.courseService.updateCategory('', { key: category, value: filteredCourses });

    this.isAddCategoryDialogVisible = false;

    // تحديث البيانات محلياً حتى تظهر في الواجهة بدون إعادة تحميل
    this.courses = {
      ...this.courses,
      [category]: filteredCourses
    };

    console.log('Category and courses added successfully!', category);
  } catch (error) {
    console.error('Error saving new category:', error);
  }
}


  cancelAddCategory() {
    this.isAddCategoryDialogVisible = false;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
