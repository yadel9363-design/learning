import { Injectable, inject, EnvironmentInjector, runInInjectionContext } from '@angular/core';
import { Firestore, doc, docData, updateDoc, arrayUnion, deleteDoc, setDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { deleteField } from '@angular/fire/firestore';

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

  async createCourse(category: string, course: string) {
    return this.runInCtx(async () => {
      await updateDoc(this.getDocRef(), {
        [category + '.value']: arrayUnion({ name: course, createdAt: new Date().toISOString() })
      });
    });
  }

  async updateCategory(oldKey: string, updatedCategory: { key: string; value: string[] }) {
    return this.runInCtx(async () => {
      const docRef = this.getDocRef();
      const updatePayload: any = {};

      updatePayload[updatedCategory.key] = {
        value: updatedCategory.value.map(v => ({
          name: v,
          createdAt: new Date().toISOString()
        })),
        createdAt: new Date().toISOString()
      };

      if (oldKey && oldKey !== updatedCategory.key) {
        updatePayload[oldKey] = deleteField();
      }

      await setDoc(docRef, updatePayload, { merge: true });
      console.log('✅ Category updated successfully');
    });
  }

  async deleteCategory(categoryKey: string) {
    return this.runInCtx(async () => {
      const docRef = this.getDocRef();
      await updateDoc(docRef, {
        [categoryKey]: deleteField()
      });
    });
  }

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

  async migrateCategories(oldData: any) {
    return this.runInCtx(async () => {
      const docRef = this.getDocRef();
      const updatePayload: any = {};

      Object.keys(oldData).forEach(catKey => {
        const value = oldData[catKey];
        if (Array.isArray(value)) {
          updatePayload[catKey] = {
            value: value.map(v => ({
              name: v,
              createdAt: new Date().toISOString()
            })),
            createdAt: new Date().toISOString()
          };
        }
      });

      await setDoc(docRef, updatePayload, { merge: true });
    });
  }
}
