import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Post } from '../models/interface/posts';
import { environment } from 'src/environments/environment';
import { catchError, finalize, firstValueFrom, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  #posts = signal<Post[]>([]);
  posts = this.#posts.asReadonly();

  #isPostLoading = signal<boolean>(false);
  isPostLoading = this.#isPostLoading.asReadonly();

  env = environment;

  constructor(private readonly http: HttpClient) {}

  async loadAllPosts(): Promise<void> {
    this.#isPostLoading.set(true);

    try {
      const posts$ = this.http.get<Post[]>(`${this.env.apiRoot}/post`).pipe(
        tap(() => console.log('fetching posts....')),
        tap((posts) => console.log(`Post received: ${posts.length}`)),
        catchError((error) => {
          console.error('Http error occured: ', error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.#isPostLoading.set(false);
        })
      );
      const posts = await firstValueFrom(posts$);
      this.#posts.set(posts);
    } catch (error) {
      this.#isPostLoading.set(false);
      console.error('An error occured: ', error);
    }
  }
}
