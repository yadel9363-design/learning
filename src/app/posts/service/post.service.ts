import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private url: string = 'https://jsonplaceholder.typicode.com/posts';

  // data هنا نخزن ال
  private postsSubject = new BehaviorSubject<any[]>([]);

  // هنا تقدر تتابع ال data فى اي مكان عن طريق (asObservable)
  posts$ = this.postsSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadPosts() {
    this.http.get<any[]>(this.url).subscribe((data) => {
      this.postsSubject.next(data);
    });
  }

  createPost(post: any) {
    return this.http.post(this.url, post).subscribe((res: any) => {
      const current = this.postsSubject.value;
      this.postsSubject.next([res, ...current]); // ⬅️ أضف البوست الجديد
    });
  }

  updatePost(post: any) {
    return this.http.put(`${this.url}/${post.id}`, post).subscribe((res: any) => {
      const updated = this.postsSubject.value.map(p =>
        p.id === post.id ? { ...p, ...post } : p
      );
      this.postsSubject.next(updated); // ⬅️ حدث القائمة
    });
  }

  deletePost(post: any) {
    return this.http.delete(`${this.url}/${post.id}`).subscribe(() => {
      const filtered = this.postsSubject.value.filter(p => p.id !== post.id);
      this.postsSubject.next(filtered); // ⬅️ احذف البوست
    });
  }
}
