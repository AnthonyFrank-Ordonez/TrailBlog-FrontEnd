import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { CreatePostRequest, Post } from '@core/models/interface/posts';
import { catchError, finalize, firstValueFrom, Observable, of, tap, throwError } from 'rxjs';
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

  #posts = signal<Post[]>([]);
  posts = this.#posts.asReadonly();

  #isPostLoading = signal<boolean>(false);
  #isSubmitting = signal<boolean>(false);

  isPostLoading = this.#isPostLoading.asReadonly();
  isSubmitting = this.#isSubmitting.asReadonly();

  env = environment;

  loadALlPosts(page: number = 1, pageSize: number = 10) {
    this.#isPostLoading.set(true);

    return this.http.get<PageResult<Post>>(`${this.env.apiRoot}/post?page=1&pageSize=10`).pipe(
      tap((result) => {
        console.log('fetching posts....');
        this.#posts.set(result.data);
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

  likePost(postId: string) {
    return this.http.post<Post>(`${this.env.apiRoot}/post/${postId}/like`, null).pipe(
      tap((updatedPost) => {
        console.log('liking the post...');

        this.#posts.update((posts) =>
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

        this.#posts.update((posts) =>
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

        this.#posts.update((posts) =>
          posts.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post)),
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
