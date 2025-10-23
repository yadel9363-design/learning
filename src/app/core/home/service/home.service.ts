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
export class homeService {
  private firestore = inject(Firestore);
  private envInjector = inject(EnvironmentInjector);

  private runInCtx<T>(fn: () => T): T {
    return runInInjectionContext(this.envInjector, fn);
  }

  public getDocRef() {
    return doc(this.firestore, 'chardetails/details');
  }

  getDetails(): Observable<any> {
    return this.runInCtx(() => docData(this.getDocRef()));
  }
}
