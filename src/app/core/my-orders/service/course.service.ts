import { Injectable } from '@angular/core';
import { Firestore, doc, docData, updateDoc, arrayUnion, deleteDoc, setDoc, DocumentReference } from '@angular/fire/firestore';
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
      [category]: arrayUnion(course)
    });
  }

async updateCategory(oldKey: string, updatedCategory: { key: string; value: string[] }) {
  try {
    const docRef = this.getDocRef();

    const updatePayload: any = {};
    updatePayload[updatedCategory.key] = updatedCategory.value;

    if (oldKey && oldKey !== updatedCategory.key) {
      updatePayload[oldKey] = deleteField();
    }

    // بدل updateDoc بـ setDoc مع merge true
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
    console.log('✅ Category deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting category:', error);
  }
}

async createCategory(title: string): Promise<void> {
  try {
    const docRef = this.getDocRef();
    await updateDoc(docRef, {
      [title]: []  // إنشاء كاتيجوري جديدة بكورسات فاضية
    });
    console.log(`✅ Category '${title}' created successfully`);
  } catch (error) {
    console.error('❌ Error creating category:', error);
    throw error;
  }
}

}
