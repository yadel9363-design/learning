import { Injectable } from '@angular/core';
import { Firestore, doc, docData, updateDoc, arrayUnion, deleteDoc, setDoc, DocumentReference, serverTimestamp } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { deleteField } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
export class CourseService {
  constructor(private firestore: Firestore) {}

  public getDocRef(): DocumentReference {
    return doc(this.firestore, 'categories/Courses');
  }

  getCourses(): Observable<any> {
    return docData(this.getDocRef());
  }

  async createCourse(category: string, course: string) {
    await updateDoc(this.getDocRef(), {
      [category + '.value']: arrayUnion({ name: course, createdAt: new Date().toISOString() })
    });
  }

  async updateCategory(oldKey: string, updatedCategory: { key: string; value: string[] }) {
    try {
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
    } catch (error) {
      console.error('❌ Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(categoryKey: string) {
    try {
      const docRef = doc(this.firestore, 'categories/Courses');
      await updateDoc(docRef, {
        [categoryKey]: deleteField()
      });
    } catch (error) {
      console.error('❌ Error deleting category:', error);
    }
  }

  async createCategory(title: string): Promise<void> {
    try {
      const docRef = this.getDocRef();
      await updateDoc(docRef, {
        [title]: {
          value: [],
          createdAt: new Date().toISOString()
        }
      });
      console.log(`✅ Category '${title}' created successfully`);
    } catch (error) {
      console.error('❌ Error creating category:', error);
      throw error;
    }
  }

  // 🟢 Migration: تحويل البيانات القديمة إلى هيكل جديد فيه createdAt
// course.service.ts
async migrateCategories(oldData: any) {
  try {
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

    // 🟢 مره واحدة كفاية → بعد كده ما تستخدمهاش
    await setDoc(docRef, updatePayload, { merge: true });
    console.log('✅ Migration Done Successfully');
  } catch (error) {
    console.error('❌ Migration Error:', error);
  }
}

}
