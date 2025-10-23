import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { CreatePostRequest, Post } from '@core/models/interface/posts';
import { catchError, EMPTY, finalize, firstValueFrom, Observable, of, tap, throwError } from 'rxjs';
import { MessageService } from './message.service';
import { handleHttpError } from '@shared/utils/utils';
import { environment } from '@env/environment';
import { PageResult } from '@core/models/interface/page-result';
import { ReactionRequest } from '@core/models/interface/reactions';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);

  #postsSignal = signal<Post[]>([]);
  #isPostLoading = signal<boolean>(false);
  #isSubmitting = signal<boolean>(false);
  #currentPageSignal = signal<number>(0);
  #pageSizeSignal = signal<number>(10);
  #totalPagesSignal = signal<number>(0);
  #totalCountSignal = signal<number>(0);
  #sessionIdSignal = signal<string>('');

  isPostLoading = this.#isPostLoading.asReadonly();
  isSubmitting = this.#isSubmitting.asReadonly();
  posts = this.#postsSignal.asReadonly();

  env = environment;

  readonly hasMore = computed(() => this.#currentPageSignal() < this.#totalPagesSignal());

  loadInitialPosts() {
    this.#postsSignal.set([]);
    this.#currentPageSignal.set(0);
    this.#sessionIdSignal.set('');

    return this.loadMorePosts();
  }

  loadMorePosts() {
    if (this.#isPostLoading()) {
      console.log('Already loading, skipping...');
      return EMPTY;
    }

    // Check if we have more pages
    if (this.#currentPageSignal() > 0 && !this.hasMore()) {
      console.log('No more posts to load');
      return EMPTY;
    }

    this.#isPostLoading.set(true);

    const nextPage = this.#currentPageSignal() + 1;

    let params = new HttpParams().set('page', nextPage).set('pageSize', this.#pageSizeSignal());

    if (this.#sessionIdSignal()) {
      params = params.set('sessionId', this.#sessionIdSignal());
    }

    return this.http
      .get<PageResult<Post>>(`${this.env.apiRoot}/post`, { params, observe: 'response' })
      .pipe(
        tap((result) => {
          const response = result.body!;
          const sessionId = result.headers.get('X-Session-Id');

          if (sessionId) {
            this.#sessionIdSignal.set(sessionId);
          }

          this.#postsSignal.update((currentPosts) => [...currentPosts, ...response.data]);

          this.#totalCountSignal.set(response.totalCount);
          this.#totalPagesSignal.set(response.totalPages);
          this.#currentPageSignal.set(nextPage);
        }),
        catchError((error: HttpErrorResponse) => {
          return throwError(() => error);
        }),
        finalize(() => {
          this.#isPostLoading.set(false);
        }),
      );
  }

  createPost(postData: CreatePostRequest) {
    this.#isSubmitting.set(true);

    return this.http.post<Post>(`${this.env.apiRoot}/post`, postData).pipe(
      tap((post) => {
        console.log('creating posts...');

        this.#postsSignal.update((values) => [...values, post]);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isSubmitting.set(false);
      }),
    );
  }

  likePost(postId: string) {
    return this.http.post<Post>(`${this.env.apiRoot}/post/${postId}/like`, null).pipe(
      tap((updatedPost) => {
        console.log('liking the post...');

        this.#postsSignal.update((posts) =>
          posts.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post)),
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  dislikePost(postId: string) {
    return this.http.post<Post>(`${this.env.apiRoot}/post/${postId}/dislike`, null).pipe(
      tap((updatedPost) => {
        console.log('disliking the post...');

        this.#postsSignal.update((posts) =>
          posts.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post)),
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  toggleReactions(postId: string, reactionData: ReactionRequest): Observable<Post> {
    return this.http.post<Post>(`${this.env.apiRoot}/post/${postId}/reaction`, reactionData).pipe(
      tap((updatedPost) => {
        console.log('Reacting to the post...');

        this.#postsSignal.update((posts) =>
          posts.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post)),
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
