import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CreatePostRequest, Post } from '@core/models/interface/posts';
import { catchError, finalize, firstValueFrom, of, tap, throwError } from 'rxjs';
import { MessageService } from './message.service';
import { handleHttpError } from '@shared/utils/utils';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private messageService = inject(MessageService);

  #posts = signal<Post[]>([]);
  posts = this.#posts.asReadonly();

  #isPostLoading = signal<boolean>(false);
  #isSubmitting = signal<boolean>(false);

  isPostLoading = this.#isPostLoading.asReadonly();
  isSubmitting = this.#isSubmitting.asReadonly();

  env = environment;

  constructor(private readonly http: HttpClient) {}

  async loadAllPosts(): Promise<void> {
    this.#isPostLoading.set(true);

    try {
      const posts$ = this.http.get<Post[]>(`${this.env.apiRoot}/post`).pipe(
        tap(() => console.log('fetching posts....')),
        tap((posts) => console.log(`Post received: ${posts.length}`)),
        catchError((error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
          return of([]);
        }),
        finalize(() => {
          this.#isPostLoading.set(false);
        }),
      );
      const posts = await firstValueFrom(posts$);
      this.#posts.set(posts);
    } catch (error) {
      this.#isPostLoading.set(false);
      console.error('An error occured: ', error);
    }
  }

  createPost(postData: CreatePostRequest) {
    this.#isSubmitting.set(true);

    return this.http.post<Post>(`${this.env.apiRoot}/post`, postData).pipe(
      tap((post) => {
        console.log('creating posts...');

        this.#posts.update((values) => [...values, post]);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isSubmitting.set(false);
      }),
    );
  }
}
