import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Post } from '../models/interface/posts';
import { environment } from 'src/environments/environment';
import { catchError, firstValueFrom, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  #posts = signal<Post[]>([]);
  posts = this.#posts.asReadonly();

  env = environment;

  constructor(private readonly http: HttpClient) {}

  async loadAllPosts(): Promise<void> {
    try {
      const posts$ = this.http.get<Post[]>(`${this.env.apiRoot}/post`).pipe(
        tap(() => console.log('fetching posts....')),
        tap((posts) => console.log(`Post received: ${posts.length}`)),
        catchError((error) => {
          console.error('Http error occured: ', error);
          return throwError(() => error);
        })
      );
      const posts = await firstValueFrom(posts$);
      this.#posts.set(posts);
    } catch (error) {
      console.error('An error occured: ', error);
    }
  }
}
