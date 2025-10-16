import { Component, inject, OnInit } from '@angular/core';
import { MyOrdersComponent } from '../../my-orders/component/my-orders.component';
import { CourseService } from '../../my-orders/service/course.service';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs/operators';

// 👇 تعريف نوع واحد للكورس
export interface CourseItem {
  name: string;
  description: string;
  createdAt?: string;
}

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
  newCategoryTitle = '';
  newCourses: CourseItem[] = [];
  isAddCategoryDialogVisible = false;

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
    this.newCourses = [{ name: '', description: '' }];
  }

  addNewCourse() {
    this.newCourses.push({ name: '', description: '' });
  }

  deleteNewCourse(index: number) {
    this.newCourses.splice(index, 1);
  }

  isSaveDisabled(): boolean {
    if (!this.newCategoryTitle.trim()) return true;
    // لازم كل course يكون ليه name و description
    return this.newCourses.some(c => !c.name.trim() || !c.description.trim());
  }

  async saveNewCategory() {
    const category = this.newCategoryTitle.trim();
    if (!category) return;

    // حذف الكورسات الفاضية
    const filteredCourses: CourseItem[] = this.newCourses
      .filter(c => c.name.trim() && c.description.trim())
      .map(c => ({
        name: c.name.trim(),
        description: c.description.trim(),
        createdAt: new Date().toISOString()
      }));

    try {
      // ✅ عدّل CourseService ليستقبل CourseItem[] بدل string[]
      await this.courseService.updateCategory('', {
        key: category,
        value: filteredCourses
      });

      this.isAddCategoryDialogVisible = false;

      // ✅ نفس شكل Firestore
      this.courses = {
        ...this.courses,
        [category]: {
          value: filteredCourses,
          createdAt: new Date().toISOString()
        }
      };

      console.log('✅ Category and courses added successfully!', category);
    } catch (error) {
      console.error('❌ Error saving new category:', error);
    }
  }

  cancelAddCategory() {
    this.isAddCategoryDialogVisible = false;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
