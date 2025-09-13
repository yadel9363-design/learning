import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { PostCreateComponent } from '../../posts/components/posts.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PostService } from '../../posts/service/post.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-my-orders',
  imports: [
    ButtonModule,
    TableModule,
    PostCreateComponent,
    DialogModule,
    InputTextModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule
  ],
  templateUrl: './my-orders.component.html',
  styleUrl: './my-orders.component.scss'
})
export class MyOrdersComponent implements OnInit {

  data: any;
  
  selectedPost: any = null;
isEditDialogVisible: boolean = false;
newTitle: string = '';

user: any;



  constructor(private postService: PostService) {}

  ngOnInit() {
    this.postService.loadPosts();

    this.postService.posts$.subscribe((posts) => {
      this.data = posts;
    });

  }

  createPost(input: HTMLInputElement) {
    let post = { title: input.value, id: '' };
    this.postService.createPost(post);
    input.value = ''; // reset input
  }

  openEditDialog(post: any) {
    this.selectedPost = post;
    this.newTitle = post.title;
    this.isEditDialogVisible = true;
  }

  deletePost(post: any) {
    if (confirm('هل أنت متأكد من حذف البوست؟')) {
      this.postService.deletePost(post);
    }
  }

  saveUpdatedPost() {
    if (!this.newTitle.trim()) return;
  
    const updatedPost = { ...this.selectedPost, title: this.newTitle };
    this.postService.updatePost(updatedPost);
    this.isEditDialogVisible = false;
  }


}
