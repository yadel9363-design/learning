import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PostService } from '../service/post.service';

@Component({
  selector: 'app-posts',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './posts.component.html',
  styleUrl: './posts.component.scss'
})
export class PostCreateComponent {
  postForm: FormGroup;

  constructor(private fb: FormBuilder, private postService: PostService) {
    this.postForm = this.fb.group({
      title: ['']
    });
  }

  onSubmit() {
  // شرط إضافي يمنع الإرسال لو العنوان فاضي أو فقط فراغات
  if (this.postForm.valid && this.postForm.value.title.trim() !== '') {
    const newPost = { title: this.postForm.value.title.trim(), id: '' };
    this.postService.createPost(newPost);
    this.postForm.reset();
  } else {
    // هنا ممكن تضيف رسالة تحذيرية لو حابب، مثلاً alert أو غيره
    alert('يرجى إدخال عنوان للنشر.');
  }
  }
}
