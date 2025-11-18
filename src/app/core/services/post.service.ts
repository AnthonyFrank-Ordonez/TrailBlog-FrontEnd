import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CreatePostRequest,
  DropdownType,
  Post,
  PostAction,
  PostDropdown,
  PostLoadingStrategy,
  PostStrategyConfig,
  RecentViewedPost,
} from '@core/models/interface/posts';
import {
  catchError,
  EMPTY,
  finalize,
  firstValueFrom,
  Observable,
  of,
  single,
  tap,
  throwError,
} from 'rxjs';
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

  #postSignal = signal<Post[]>([]);
  #mostPopularPostsSignal = signal<Post[]>([]);
  #recentViewedPostsSignal = signal<RecentViewedPost[]>([]);
  #postDetailSignal = signal<Post>(POST_PLACEHOLDER);
  #postLoadingStrategySignal = signal<PostLoadingStrategy>('regular');
  #isPostLoadingSignal = signal<boolean>(false);
  #isRecentPostsLoadingSignal = signal<boolean>(false);
  #isMostPopularPostsLoading = signal<boolean>(false);
  #isSubmittingSignal = signal<boolean>(false);
  #currentPageSignal = signal<number>(0);
  #pageSizeSignal = signal<number>(10);
  #totalPagesSignal = signal<number>(0);
  #totalCountSignal = signal<number>(0);
  #sessionIdSignal = signal<string>('');
  #postMenuModalIdSignal = signal<string | null>(null);
  #activeDropdown = signal<PostDropdown>({ type: null, id: null });

  posts = this.#postSignal.asReadonly();
  mostPopularPosts = this.#mostPopularPostsSignal.asReadonly();
  recentViewedPosts = this.#recentViewedPostsSignal.asReadonly();
  postDetail = this.#postDetailSignal.asReadonly();
  isPostLoading = this.#isPostLoadingSignal.asReadonly();
  isMostPopularPostsLoading = this.#isMostPopularPostsLoading.asReadonly();
  isRecentPostsLoading = this.#isRecentPostsLoadingSignal.asReadonly();
  isSubmitting = this.#isSubmittingSignal.asReadonly();
  postMenuModalId = this.#postMenuModalIdSignal.asReadonly();
  activeDropdown = this.#activeDropdown.asReadonly();

  readonly hasMore = computed(() => this.#currentPageSignal() < this.#totalPagesSignal());

  private readonly strategyConfig: Record<PostLoadingStrategy, PostStrategyConfig> = {
    regular: {
      endpoint: this.apiUrl,
      useSessionId: true,
    },
    popular: {
      endpoint: `${this.apiUrl}/popular`,
      useSessionId: false,
    },
  };

  private readonly shareActionHandlers = new Map<PostAction, (post: Post) => Promise<void> | void>([
    ['copy', (post) => this.copyPostLink(post)],
    ['embed', (post) => this.copyPostLink(post)],
  ]);

  loadInitialPosts(strategy: PostLoadingStrategy = 'regular') {
    this.#postSignal.set([]);
    this.#currentPageSignal.set(0);
    this.#sessionIdSignal.set('');
    this.#postLoadingStrategySignal.set(strategy);

    return this.loadMorePosts();
  }

  loadMorePosts(): Observable<HttpResponse<PageResult<Post>>> {
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
    const strategy = this.#postLoadingStrategySignal();
    const config = this.strategyConfig[strategy];

    let params = new HttpParams().set('page', nextPage).set('pageSize', this.#pageSizeSignal());

    if (config.useSessionId && this.#sessionIdSignal()) {
      params = params.set('sessionId', this.#sessionIdSignal());
    }

    return this.http.get<PageResult<Post>>(config.endpoint, { params, observe: 'response' }).pipe(
      tap((result) => {
        const response = result.body!;

        if (config.useSessionId) {
          const sessionId = result.headers.get('X-Session-Id');

          if (sessionId) {
            this.#sessionIdSignal.set(sessionId);
          }
        }

        this.#postSignal.update((currentPosts) => [...currentPosts, ...response.data]);

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

  loadMostPopularPost(): Observable<PageResult<Post>> {
    this.#isMostPopularPostsLoading.set(true);

    let params = new HttpParams().set('page', 1).set('pageSize', 5);

    return this.http.get<PageResult<Post>>(`${this.apiUrl}/popular`, { params }).pipe(
      tap((result) => {
        console.log('Fetching most popular posts...');
        this.#mostPopularPostsSignal.set(result.data);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isMostPopularPostsLoading.set(false);
      }),
    );
  }

  loadPostDetail(slug: string): Observable<Post> {
    this.#isPostLoadingSignal.set(true);
    const encodedSlug = encodeURIComponent(slug);

    return this.http.get<Post>(`${this.apiUrl}/slug/${encodedSlug}`).pipe(
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

        this.#postSignal.update((values) => [...values, post]);
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isSubmittingSignal.set(false);
      }),
    );
  }

  addPostComment(commentData: AddCommentRequest): Observable<Comment> {
    this.#isSubmittingSignal.set(true);

    return this.http.post<Comment>(`${this.env.apiRoot}/comment`, commentData).pipe(
      tap((newComment) => {
        console.log('Adding Comment...');

        this.#postSignal.update((posts) =>
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

        this.#postSignal.update((posts) =>
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

  updateActiveDropdown(type: DropdownType, id: string) {
    this.#activeDropdown.set({ type: type, id: id });
  }

  closeDropdown() {
    this.#activeDropdown.set({ type: null, id: null });
  }

  resetPostServiceData(): void {
    this.#recentViewedPostsSignal.set([]);
  }

  async handlePostShareAction(action: PostAction, post: Post): Promise<void> {
    const handler = this.shareActionHandlers.get(action);

    if (handler) {
      await handler(post);
      this.closeDropdown();
    } else {
      console.warn(`Unknown share action: ${action}`);
    }
  }

  private async copyPostLink(post: Post): Promise<void> {
    const url = this.buildPostUrl(post.slug);

    try {
      await navigator.clipboard.writeText(url);
    } catch (error) {
      console.error('Copy Failed: ', error);
      throw error;
    }
  }

  private buildPostUrl(slug: string): string {
    return `${window.location.origin}/post/${encodeURIComponent(slug)}`;
  }
}
