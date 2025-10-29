import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { CreatePostRequest, Post, RecentViewedPost } from '@core/models/interface/posts';
import { catchError, EMPTY, finalize, firstValueFrom, Observable, of, tap, throwError } from 'rxjs';
import { MessageService } from './message.service';
import { handleHttpError, POST_PLACEHOLDER } from '@shared/utils/utils';
import { environment } from '@env/environment';
import { PageResult } from '@core/models/interface/page-result';
import { ReactionRequest } from '@core/models/interface/reactions';
import { AddCommentRequest, Comment } from '@core/models/interface/comments';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  env = environment;
  private http = inject(HttpClient);
  private readonly apiUrl = `${this.env.apiRoot}/post`;

  #postsSignal = signal<Post[]>([]);
  #postDetailSignal = signal<Post>(POST_PLACEHOLDER);
  #recentViewedPostsSignal = signal<RecentViewedPost[]>([]);
  #isPostLoadingSignal = signal<boolean>(false);
  #isRecentPostsLoadingSignal = signal<boolean>(false);
  #isSubmittingSignal = signal<boolean>(false);
  #currentPageSignal = signal<number>(0);
  #pageSizeSignal = signal<number>(10);
  #totalPagesSignal = signal<number>(0);
  #totalCountSignal = signal<number>(0);
  #sessionIdSignal = signal<string>('');

  posts = this.#postsSignal.asReadonly();
  postDetail = this.#postDetailSignal.asReadonly();
  recentViewedPosts = this.#recentViewedPostsSignal.asReadonly();
  isPostLoading = this.#isPostLoadingSignal.asReadonly();
  isRecentPostsLoading = this.#isRecentPostsLoadingSignal.asReadonly();
  isSubmitting = this.#isSubmittingSignal.asReadonly();

  readonly hasMore = computed(() => this.#currentPageSignal() < this.#totalPagesSignal());

  loadInitialPosts() {
    this.#postsSignal.set([]);
    this.#currentPageSignal.set(0);
    this.#sessionIdSignal.set('');

    return this.loadMorePosts();
  }

  loadMorePosts() {
    if (this.#isPostLoadingSignal()) {
      console.log('Already loading, skipping...');
      return EMPTY;
    }

    // Check if we have more pages
    if (this.#currentPageSignal() > 0 && !this.hasMore()) {
      console.log('No more posts to load');
      return EMPTY;
    }

    this.#isPostLoadingSignal.set(true);

    const nextPage = this.#currentPageSignal() + 1;

    let params = new HttpParams().set('page', nextPage).set('pageSize', this.#pageSizeSignal());

    if (this.#sessionIdSignal()) {
      params = params.set('sessionId', this.#sessionIdSignal());
    }

    return this.http.get<PageResult<Post>>(this.apiUrl, { params, observe: 'response' }).pipe(
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
        this.#isPostLoadingSignal.set(false);
      }),
    );
  }

  loadPostDetail(slug: string): Observable<Post> {
    this.#isPostLoadingSignal.set(true);

    return this.http.get<Post>(`${this.apiUrl}/slug/${encodeURIComponent(slug)}`).pipe(
      tap((response) => {
        console.log('Fetching post detail..');

        this.#postDetailSignal.set(response);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => this.#isPostLoadingSignal.set(false)),
    );
  }

  loadRecentViewedPosts(): Observable<RecentViewedPost[]> {
    this.#isRecentPostsLoadingSignal.set(true);

    return this.http.get<RecentViewedPost[]>(`${this.apiUrl}/recent-viewed-posts`).pipe(
      tap((response) => {
        console.log('Fetching recent viewed posts...');
        this.#recentViewedPostsSignal.set(response);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isRecentPostsLoadingSignal.set(false);
      }),
    );
  }

  createPost(postData: CreatePostRequest) {
    this.#isSubmittingSignal.set(true);

    return this.http.post<Post>(this.apiUrl, postData).pipe(
      tap((post) => {
        console.log('creating posts...');

        this.#postsSignal.update((values) => [...values, post]);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isSubmittingSignal.set(false);
      }),
    );
  }

  likePost(postId: string) {
    return this.http.post<Post>(`${this.apiUrl}/${postId}/like`, null).pipe(
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
    return this.http.post<Post>(`${this.apiUrl}/${postId}/dislike`, null).pipe(
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

  addPostComment(commentData: AddCommentRequest): Observable<Comment> {
    this.#isSubmittingSignal.set(true);

    return this.http.post<Comment>(`${this.env.apiRoot}/comment`, commentData).pipe(
      tap((newComment) => {
        console.log('Adding Comment...');

        this.#postsSignal.update((posts) =>
          posts.map((post) =>
            post.id === newComment.postId
              ? {
                  ...post,
                  totalComment: (post.totalComment += 1),
                  comments: [newComment, ...(post.comments ?? [])],
                }
              : post,
          ),
        );

        this.#postDetailSignal.update((currentPost) => {
          if (!currentPost) return currentPost;

          if (currentPost.id === newComment.postId) {
            return {
              ...currentPost,
              totalComment: (currentPost.totalComment += 1),
              comments: [newComment, ...(currentPost.comments ?? [])],
            };
          }

          return currentPost;
        });

        this.#postDetailSignal;
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isSubmittingSignal.set(false);
      }),
    );
  }

  toggleReactions(postId: string, reactionData: ReactionRequest): Observable<Post> {
    return this.http.post<Post>(`${this.apiUrl}/${postId}/reaction`, reactionData).pipe(
      tap((updatedPost) => {
        console.log('Reacting to the post...');

        this.#postsSignal.update((posts) =>
          posts.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post)),
        );

        this.#postDetailSignal.update((currentPost) => {
          if (!currentPost) return currentPost;

          if (currentPost.id === updatedPost.id) {
            return { ...currentPost, ...updatedPost };
          }

          return currentPost;
        });
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  resetPostServiceData(): void {
    this.#recentViewedPostsSignal.set([]);
  }
}
