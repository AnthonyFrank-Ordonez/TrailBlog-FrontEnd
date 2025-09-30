import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Post } from '../models/interface/posts';
import { environment } from 'src/environments/environment';
import { catchError, finalize, firstValueFrom, tap, throwError } from 'rxjs';
import { MessageService } from './message.service';
import { ApiError } from '../models/interface/api-error';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private messageService = inject(MessageService);

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
        catchError((error: HttpErrorResponse) => {
          if (error.error instanceof ErrorEvent) {
            this.messageService.showMessage('error', error.error.message);
            console.error(error.error.message);
          } else if (error.error && typeof error.error === 'object') {
            const apiError = error.error as ApiError;
            this.messageService.showMessage('error', apiError.detail);
            console.error('An error occured: ', apiError);
          }
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
