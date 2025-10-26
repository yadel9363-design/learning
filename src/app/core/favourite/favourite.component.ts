import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  EnvironmentInjector,
  runInInjectionContext,
  ChangeDetectorRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-favourite-selector',
  standalone: true,
  imports: [CommonModule, ToggleButtonModule, ButtonModule, ProgressSpinnerModule, FormsModule],
  templateUrl: './favourite.component.html',
  styleUrls: ['./favourite.component.scss'],
})
export class favouriteComponent implements OnInit {
  @Output() interestsSelected = new EventEmitter<string[]>();
  @Input() insideLogin: boolean = true;

  isLoading = false;
  categories: string[] = [];
  categoryStates: { [key: string]: boolean } = {};
  selectedCategories: string[] = [];

  constructor(
    private firestore: Firestore,
    private injector: EnvironmentInjector,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  /** 🔹 تحميل التصنيفات من Firestore */
  async loadCategories() {
    return runInInjectionContext(this.injector, async () => {
      try {
        this.isLoading = true;
        const refDoc = doc(this.firestore, 'categories', 'Courses');
        const docSnap = await getDoc(refDoc);
        if (docSnap.exists()) {
          const data = docSnap.data();
          this.categories = Object.keys(data || {});
          this.categories.forEach((cat) => (this.categoryStates[cat] = false));
        }
      } catch (err) {
        console.error('Error loading categories:', err);
      } finally {
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  /** 🔹 عند التبديل */
  onCategoryChange(category: string, value: boolean) {
    // تحديث فوري بدون تأخير
    this.categoryStates[category] = value;

    // تحديث المصفوفة
    this.selectedCategories = Object.keys(this.categoryStates).filter(
      (cat) => this.categoryStates[cat]
    );

    // داخل register يتم الإرسال فورًا
    if (!this.insideLogin) {
      this.interestsSelected.emit(this.selectedCategories);
    }

    this.cdRef.detectChanges();
  }

  /** 🔹 داخل login فقط */
  completeSelection() {
    this.interestsSelected.emit(this.selectedCategories);
  }
}
