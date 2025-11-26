import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CreatePostRequest,
  DropdownType,
  Post,
  PostAction,
  PostDropdown,
  PostDropdownItems,
  PostLoadingStrategy,
  PostStrategyConfig,
  RecentViewedPost,
} from '@core/models/interface/posts';
import { catchError, EMPTY, finalize, Observable, Subject, tap, throwError } from 'rxjs';
import { POST_PLACEHOLDER } from '@shared/utils/utils';
import { environment } from '@env/environment';
import { PageResult } from '@core/models/interface/page-result';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AddCommentRequest, Comment } from '@core/models/interface/comments';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { OperationResult } from '@core/models/interface/operations';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  env = environment;
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private modalService = inject(ModalService);
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
  reaction$ = new Subject<ReactionRequest>();

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

  private readonly reactionList = signal<ReactionList[]>([
    { id: 1, type: '😂', value: 'laughReact' },
    { id: 2, type: '🥲', value: 'sadReact' },
    { id: 3, type: '😡', value: 'angryReact' },
    { id: 4, type: '😍', value: 'loveReact' },
    { id: 5, type: '🚀', value: 'rocketReact' },
  ]);

  private reactionListMap = computed(
    () => new Map(this.reactionList().map((reaction) => [reaction.id, reaction])),
  );

  readonly menuActionHandlers = new Map<
    PostAction,
    (post: Post) => Observable<OperationResult | Post>
  >([
    ['delete', (post) => this.deletePost(post)],
    ['save', (post) => this.savePost(post)],
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

  getReactionList() {
    return this.reactionList();
  }

  getReactionById(id: number): ReactionList | undefined {
    return this.reactionListMap().get(id);
  }

  getMenuItems(post: Post): PostDropdownItems[] {
    var isSaved = post.isSaved;

    return [
      {
        label: isSaved ? 'Unsave' : 'Save',
        iconClass: isSaved ? 'icon-tabler-bookmark-filled' : 'icon-tabler-bookmark',
        svgPath: isSaved
          ? [
              'M14 2a5 5 0 0 1 5 5v14a1 1 0 0 1 -1.555 .832l-5.445 -3.63l-5.444 3.63a1 1 0 0 1 -1.55 -.72l-.006 -.112v-14a5 5 0 0 1 5 -5h4z',
            ]
          : ['M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z'],
        ownerOnly: false,
        forAuthenticated: true,
        hideForOwner: false,
        action: isSaved ? 'unsave' : 'save',
        fill: isSaved ? true : false,
      },
      {
        label: 'Hide',
        iconClass: 'icon-tabler-eye-off',
        svgPath: [
          'M10.585 10.587a2 2 0 0 0 2.829 2.828',
          'M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87',
          'M3 3l18 18',
        ],
        ownerOnly: false,
        forAuthenticated: true,
        hideForOwner: false,
        action: 'hide',
        fill: false,
      },
      {
        label: 'Report',
        iconClass: 'icon-tabler-message-report',
        svgPath: [
          'M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z',
          'M12 8v3',
          'M12 14v.01',
        ],
        ownerOnly: false,
        forAuthenticated: false,
        hideForOwner: true,
        action: 'report',
        fill: false,
      },
      {
        label: 'Delete',
        iconClass: 'icon-tabler-trash',
        svgPath: [
          'M4 7l16 0',
          'M10 11l0 6',
          'M14 11l0 6',
          'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
          'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
        ],
        ownerOnly: true,
        forAuthenticated: true,
        hideForOwner: false,
        action: 'delete',
        fill: false,
      },
    ];
  }

  createPost(postData: CreatePostRequest): Observable<Post> {
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

  savePost(post: Post): Observable<Post> {
    this.closeDropdown();

    return this.http.post<Post>(`${this.apiUrl}/${post.id}/saved`, null).pipe(
      tap((updatedPost) => {
        console.log('saving post...');

        this.#postSignal.update((posts) =>
          posts.map((post) => (post.id === updatedPost.id ? { ...post, ...updatedPost } : post)),
        );
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }

  deletePost(post: Post): Observable<OperationResult> {
    return this.http.delete<OperationResult>(`${this.apiUrl}/${post.id}`).pipe(
      tap(() => {
        console.log('Deleting post...');

        this.#postSignal.update((posts) => posts.filter((p) => p.id !== post.id));
        this.#recentViewedPostsSignal.update((rp) => rp.filter((p) => p.postId !== post.id));
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

  selectReaction(data: ReactionRequest): void {
    this.closeDropdown();

    if (!this.authService.isAuthenticated()) {
      this.modalService.showAuthRequiredModal();
      return;
    }

    this.reaction$.next(data);
  }

  updateActiveDropdown(type: DropdownType, id: string) {
    this.#activeDropdown.set({ type: type, id: id });
  }

  toggleReactions(reactionData: ReactionRequest): Observable<Post> {
    const { post, data } = reactionData;
    return this.http.post<Post>(`${this.apiUrl}/${post.id}/reaction`, data).pipe(
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

  toggleDropdown(type: DropdownType, id: string): void {
    if (this.isDropDownOpen(type, id)) {
      this.closeDropdown();
    } else {
      this.updateActiveDropdown(type, id);
    }
  }

  togglePostDetail(slug: string): void {
    this.closeDropdown();
    this.router.navigate(['/post', slug]);
  }

  isDropDownOpen(type: DropdownType, id: string): boolean {
    const active = this.#activeDropdown();
    return active.type === type && active.id === id;
  }

  hasReaction(userReactionsIds: number[], reactionId: number): boolean {
    return userReactionsIds.includes(reactionId);
  }

  closeDropdown(): void {
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
