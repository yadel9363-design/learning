import {
  Injectable,
  inject,
  EnvironmentInjector,
  runInInjectionContext
} from '@angular/core';
import {
  Firestore,
  doc,
  docData,
  updateDoc,
  arrayUnion,
  deleteField,
  setDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface CourseItem {
  name: string;
  description: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class CourseService {
  private firestore = inject(Firestore);
  private envInjector = inject(EnvironmentInjector);

  private runInCtx<T>(fn: () => T): T {
    return runInInjectionContext(this.envInjector, fn);
  }

  public getDocRef() {
    return doc(this.firestore, 'categories/Courses');
  }
  getCourses(): Observable<any> {
    return this.runInCtx(() => docData(this.getDocRef()));
  }

  // 🔹 إضافة كورس جديد إلى تصنيف موجود
  async createCourse(category: string, courseName: string) {
    return this.runInCtx(async () => {
      await updateDoc(this.getDocRef(), {
        [`${category}.value`]: arrayUnion({
          name: courseName,
          description: '',
          createdAt: new Date().toISOString()
        })
      });
    });
  }

  // 🔹 تحديث أو إنشاء تصنيف بكورسات جديدة
  async updateCategory(
    oldKey: string,
    updatedCategory: { key: string; value: CourseItem[] }
  ) {
    const { key, value } = updatedCategory;

    return this.runInCtx(async () => {
      const docRef = this.getDocRef();
      const updatePayload: any = {};

      // 🔹 هنا بنحافظ على الـ name و description كما هما
      updatePayload[key] = {
        value: value.map(v => ({
          name: v.name.trim(),
          description: v.description.trim(),
          createdAt: v.createdAt || new Date().toISOString()
        })),
        createdAt: new Date().toISOString()
      };

      // 🔹 لو اسم التصنيف اتغيّر نحذف القديم
      if (oldKey && oldKey !== key) {
        updatePayload[oldKey] = deleteField();
      }

      await setDoc(docRef, updatePayload, { merge: true });
      console.log('✅ Category updated successfully:', key);
    });
  }

  // 🔹 حذف تصنيف بالكامل
  async deleteCategory(categoryKey: string) {
    return this.runInCtx(async () => {
      const docRef = this.getDocRef();
      await updateDoc(docRef, {
        [categoryKey]: deleteField()
      });
      console.log(`🗑️ Category '${categoryKey}' deleted`);
    });
  }

  // 🔹 إنشاء تصنيف فارغ
  async createCategory(title: string): Promise<void> {
    return this.runInCtx(async () => {
      const docRef = this.getDocRef();
      await updateDoc(docRef, {
        [title]: {
          value: [],
          createdAt: new Date().toISOString()
        }
      });
      console.log(`✅ Category '${title}' created successfully`);
    });
  }

  // 🔹 ترحيل بيانات قديمة إلى البنية الجديدة
  async migrateCategories(oldData: any) {
    return this.runInCtx(async () => {
      const docRef = this.getDocRef();
      const updatePayload: any = {};

      Object.keys(oldData).forEach(catKey => {
        const value = oldData[catKey];
        if (Array.isArray(value)) {
          updatePayload[catKey] = {
            value: value.map(v => ({
              name: typeof v === 'string' ? v : v.name || '',
              description:
                typeof v === 'string' ? '' : v.description || '',
              createdAt: new Date().toISOString()
            })),
            createdAt: new Date().toISOString()
          };
        }
      });

      await setDoc(docRef, updatePayload, { merge: true });
      console.log('✅ Categories migrated successfully');
    });
  }
}
