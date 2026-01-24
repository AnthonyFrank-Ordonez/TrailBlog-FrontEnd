import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  httpResource,
  HttpResponse,
} from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  CreatePostRequest,
  Post,
  PostDeleteConfig,
  PostDeleteType,
  PostLoadingStrategy,
  PostStrategyConfig,
  RecentViewedPost,
} from '@core/models/interface/posts';
import { catchError, EMPTY, finalize, Observable, of, Subject, tap, throwError } from 'rxjs';
import { debounceSignal, POST_PLACEHOLDER } from '@shared/utils/utils';
import { environment } from '@env/environment';
import { PageResult, MetaData } from '@core/models/interface/page-result';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AddCommentRequest, Comment } from '@core/models/interface/comments';
import { AuthService } from './auth.service';
import { ModalService } from './modal.service';
import { OperationResult } from '@core/models/interface/operations';
import { CurrentRouteService } from './current-route.service';
import { PostAction, PostMenuItems } from '@core/models/interface/menus';
import { UserService } from './user.service';
import { UnifiedSearchResults } from '@core/models/interface/search-results';
import { DropdownService } from './dropdown.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  env = environment;
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private currentRouteService = inject(CurrentRouteService);
  private dropdownService = inject(DropdownService);
  private readonly apiUrl = `${this.env.apiRoot}/posts`;

  enteredSearchQuery = signal<string>('');
  #postSignal = signal<Post[]>([]);
  #draftPostSignal = signal<Post[]>([]);
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
  #metadataSignal = signal<MetaData | undefined>(undefined);
  #errorMessageSignal = signal<HttpErrorResponse | null>(null);
  #searchQuery = debounceSignal(this.enteredSearchQuery);
  reaction$ = new Subject<ReactionRequest>();

  posts = this.#postSignal.asReadonly();
  draftPosts = this.#draftPostSignal.asReadonly();
  mostPopularPosts = this.#mostPopularPostsSignal.asReadonly();
  recentViewedPosts = this.#recentViewedPostsSignal.asReadonly();
  postDetail = this.#postDetailSignal.asReadonly();
  isPostLoading = this.#isPostLoadingSignal.asReadonly();
  isMostPopularPostsLoading = this.#isMostPopularPostsLoading.asReadonly();
  isRecentPostsLoading = this.#isRecentPostsLoadingSignal.asReadonly();
  isSubmitting = this.#isSubmittingSignal.asReadonly();
  postMenuModalId = this.#postMenuModalIdSignal.asReadonly();
  errorMessage = this.#errorMessageSignal.asReadonly();
  metadata = this.#metadataSignal.asReadonly();
  currentPath = this.currentRouteService.currentPath;

  private unifiedSearch = httpResource<UnifiedSearchResults>(() =>
    this.#searchQuery()?.trim() ? `${this.apiUrl}/search?query=${this.#searchQuery()}` : undefined,
  );

  unifiedSearchResults = computed(() => this.unifiedSearch.value());

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
    explore: {
      endpoint: `${this.apiUrl}/explore`,
      useSessionId: true,
    },
    drafts: {
      endpoint: `${this.apiUrl}/drafts`,
      useSessionId: true,
    },
    archives: {
      endpoint: `${this.apiUrl}/archives`,
      useSessionId: false,
    },
    'profile-posts': {
      endpoint: `${this.apiUrl}/published`,
      useSessionId: false,
    },
    'profile-saved': {
      endpoint: `${this.apiUrl}/saved`,
      useSessionId: false,
    },
    'profile-view-history': {
      endpoint: `${this.apiUrl}/history`,
      useSessionId: false,
    },
  };

  private readonly deletePostConfig: Record<PostDeleteType, PostDeleteConfig> = {
    home: {
      endpoint: `${this.apiUrl}`,
    },
    saved: {
      endpoint: `${this.apiUrl}/saved`,
    },
    detail: {
      endpoint: `${this.apiUrl}`,
    },
    drafts: {
      endpoint: `${this.apiUrl}/drafts`,
    },
  };

  private readonly shareActionHandlers = new Map<PostAction, (post: Post) => Promise<void> | void>([
    ['copy', (post) => this.copyPostLink(post)],
    ['embed', (post) => this.copyPostLink(post)],
  ]);

  private readonly reactionList = signal<ReactionList[]>([
    { id: 1, type: '😂', value: 'laughReact' },
    { id: 2, type: '😢', value: 'sadReact' },
    { id: 3, type: '😡', value: 'angryReact' },
    { id: 4, type: '😍', value: 'loveReact' },
    { id: 5, type: '🚀', value: 'rocketReact' },
  ]);

  private reactionListMap = computed(
    () => new Map(this.reactionList().map((reaction) => [reaction.id, reaction])),
  );

  readonly postMenuActionHandlers = new Map<
    PostAction,
    (post: Post, type?: PostDeleteType) => Observable<OperationResult | Post>
  >([
    ['delete', (post, type) => this.deletePost(post, type)],
    ['save', (post, type) => this.savePost(post, type)],
    ['unsave', (post, type) => this.unsavePost(post, type)],
    ['archive', (post, type) => this.archivePost(post, type)],
  ]);

  loadInitialPosts(strategy: PostLoadingStrategy = 'regular') {
    this.#postSignal.set([]);
    this.#currentPageSignal.set(0);
    this.#sessionIdSignal.set('');
    this.#postLoadingStrategySignal.set(strategy);

    return this.loadMorePosts();
  }

  loadMorePosts(): Observable<HttpResponse<PageResult<Post, MetaData>>> {
    if (this.#isPostLoadingSignal()) {
      console.info('Already loading, skipping...');
      return EMPTY;
    }

    // Check if we have more pages
    if (this.#currentPageSignal() > 0 && !this.hasMore()) {
      console.info('No more posts to load');
      return EMPTY;
    }

    this.#isPostLoadingSignal.set(true);
    this.#errorMessageSignal.set(null);

    const nextPage = this.#currentPageSignal() + 1;
    const strategy = this.#postLoadingStrategySignal();
    const config = this.strategyConfig[strategy];

    let params = new HttpParams().set('page', nextPage).set('pageSize', this.#pageSizeSignal());

    if (config.useSessionId && this.#sessionIdSignal()) {
      params = params.set('sessionId', this.#sessionIdSignal());
    }

    return this.http
      .get<PageResult<Post, MetaData>>(config.endpoint, { params, observe: 'response' })
      .pipe(
        tap((result) => {
          const response = result.body!;

          if (config.useSessionId) {
            const sessionId = result.headers.get('X-Session-Id');

            if (sessionId) {
              this.#sessionIdSignal.set(sessionId);
            }
          }

          this.#postSignal.update((currentPosts) => [...currentPosts, ...response.data]);

          // Store metadata if available
          if (response.metadata) {
            this.#metadataSignal.set(response.metadata);
          }

          this.#totalCountSignal.set(response.totalCount);
          this.#totalPagesSignal.set(response.totalPages);
          this.#currentPageSignal.set(nextPage);
        }),
        catchError((error: HttpErrorResponse) => {
          this.#errorMessageSignal.set(error);
          return throwError(() => error);
        }),
        finalize(() => {
          this.#isPostLoadingSignal.set(false);
        }),
      );
  }

  loadMostPopularPost(): Observable<PageResult<Post>> {
    this.#isMostPopularPostsLoading.set(true);
    this.#errorMessageSignal.set(null);

    let params = new HttpParams().set('page', 1).set('pageSize', 5);

    return this.http.get<PageResult<Post>>(`${this.apiUrl}/popular`, { params }).pipe(
      tap((result) => {
        console.log('Fetching most popular posts...');
        this.#mostPopularPostsSignal.set(result.data);
      }),
      catchError((error) => {
        this.#errorMessageSignal.set(error);
        return throwError(() => error);
      }),
      finalize(() => {
        this.#isMostPopularPostsLoading.set(false);
      }),
    );
  }

  loadPostDetail(slug: string): Observable<Post> {
    this.#isPostLoadingSignal.set(true);
    this.#errorMessageSignal.set(null);
    const encodedSlug = encodeURIComponent(slug);

    return this.http.get<Post>(`${this.apiUrl}/slug/${encodedSlug}`).pipe(
      tap((response) => {
        console.log('Fetching post detail..');

        this.#postDetailSignal.set(response);
      }),
      catchError((error) => {
        this.#errorMessageSignal.set(error);
        return throwError(() => error);
      }),
      finalize(() => this.#isPostLoadingSignal.set(false)),
    );
  }

  loadRecentViewedPosts(): Observable<RecentViewedPost[]> {
    this.#isRecentPostsLoadingSignal.set(true);
    this.#errorMessageSignal.set(null);

    return this.http.get<RecentViewedPost[]>(`${this.apiUrl}/recent-viewed-posts`).pipe(
      tap((response) => {
        console.log('Fetching recent viewed posts...');
        this.#recentViewedPostsSignal.set(response);
      }),
      catchError((error) => {
        this.#errorMessageSignal.set(error);
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

  getMenuItems(post: Post): PostMenuItems[] {
    var isSaved = post.isSaved;
    const activeUserTab = this.userService.activeUserTab();

    const allMenuItems: PostMenuItems[] = [
      {
        type: 'post',
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
        type: 'post',
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
        type: 'post',
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
        type: 'post',
        label: 'Archive',
        iconClass: 'icon-tabler-archive',
        svgPath: [
          'M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v0a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z',
          'M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-10',
          'M10 12l4 0',
        ],
        ownerOnly: true,
        forAuthenticated: true,
        hideForOwner: false,
        action: 'archive',
        fill: false,
      },
      {
        type: 'post',
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

    // Filter menu items based on whether user is on drafts page or archives page
    if (activeUserTab === 'drafts' || activeUserTab === 'archives') {
      return allMenuItems.filter((item) => item.action === 'delete');
    }

    return allMenuItems;
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

  createDraftPost(postData: CreatePostRequest): Observable<Post> {
    this.dropdownService.closeDropdown();
    this.#isSubmittingSignal.set(true);

    return this.http.post<Post>(`${this.apiUrl}/drafts`, postData).pipe(
      tap((post) => {
        console.log('Creating draft posts...');

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

  savePost(post: Post, type?: string): Observable<Post> {
    this.dropdownService.closeDropdown();

    const previousSavedState = post.isSaved;
    const optimisticPost = { ...post, isSaved: true };

    this.updatePostsWithOptimisticData(post.id, optimisticPost);

    return this.http.post<Post>(`${this.apiUrl}/saved/${post.id}`, null).pipe(
      tap((updatedPost) => {
        console.log('Post saved successfully');
        this.updatePostsWithOptimisticData(post.id, updatedPost);
      }),
      catchError((error) => {
        console.error('Save post failed, rolling back', error);
        const rollbackPost = { ...post, isSaved: previousSavedState };
        this.updatePostsWithOptimisticData(post.id, rollbackPost);
        return throwError(() => error);
      }),
    );
  }

  publishDraftPost(post: Post): Observable<Post> {
    const publishedPost = post;
    const oldIndex = this.#postSignal().findIndex((p) => p.id === post.id);
    this.removePostOptimistic(post.id);

    return this.http.patch<Post>(`${this.apiUrl}/drafts/${post.id}/publish`, null).pipe(
      tap(() => {
        console.log('Publishing post...');
      }),
      catchError((error) => {
        this.rollbackRemovePostOptimistic(oldIndex, publishedPost);
        return throwError(() => error);
      }),
    );
  }

  addPostComment(commentData: AddCommentRequest): Observable<Comment> {
    this.#isSubmittingSignal.set(true);

    return this.http.post<Comment>(`${this.env.apiRoot}/comments`, commentData).pipe(
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

  unsavePost(post: Post, type?: string): Observable<OperationResult> {
    this.dropdownService.closeDropdown();

    const unsavePost = post;
    const oldIndex = this.#postSignal().findIndex((p) => p.id === post.id);
    const previousSavedState = post.isSaved;
    const optimisticPost = { ...post, isSaved: false };

    // Remove post from list if user is on saved posts page
    if (this.currentPath() === '/profile#saved') {
      this.removePostOptimistic(post.id);
    } else {
      this.updatePostsWithOptimisticData(post.id, optimisticPost);
    }

    return this.http.delete<OperationResult>(`${this.apiUrl}/saved/${post.id}`).pipe(
      tap(() => {
        console.log('Post unsaved successfully');
      }),
      catchError((error) => {
        console.error('Unsave post failed, rolling back', error);
        const rollbackPost = { ...post, isSaved: previousSavedState };

        // Rollback post to previous state
        if (this.currentPath() === '/profile#saved') {
          this.rollbackRemovePostOptimistic(oldIndex, unsavePost);
        } else {
          this.updatePostsWithOptimisticData(post.id, rollbackPost);
        }

        return throwError(() => error);
      }),
    );
  }

  archivePost(post: Post, type?: string): Observable<OperationResult> {
    this.dropdownService.closeDropdown();

    const archivedPost = post;
    const oldIndex = this.#postSignal().findIndex((p) => p.id === post.id);
    this.removePostOptimistic(post.id);

    return this.http.patch<OperationResult>(`${this.apiUrl}/${post.id}/archive`, null).pipe(
      tap(() => {
        console.log('Archiving post...');
      }),
      catchError((error) => {
        this.rollbackRemovePostOptimistic(oldIndex, archivedPost);
        return throwError(() => error);
      }),
    );
  }

  deletePost(post: Post, type?: PostDeleteType): Observable<OperationResult> {
    const config = this.deletePostConfig[type || 'home'];

    const deletedPost = post;
    const oldIndex = this.#postSignal().findIndex((p) => p.id === post.id);

    this.removePostOptimistic(post.id);

    return this.http.delete<OperationResult>(`${config.endpoint}/${post.id}`).pipe(
      tap(() => {
        console.log('Deleting post...');

        if (type === 'detail') {
          this.currentRouteService.handleRedirection('/');
        }
      }),
      catchError((error) => {
        this.rollbackRemovePostOptimistic(oldIndex, deletedPost);
        return throwError(() => error);
      }),
    );
  }

  clearRecentViewedPosts(): Observable<OperationResult> {
    const previousPosts = this.#recentViewedPostsSignal();
    this.#recentViewedPostsSignal.set([]);

    return this.http.delete<OperationResult>(`${this.apiUrl}/recent-viewed-posts`).pipe(
      tap(() => {
        console.log('Succesfully cleared recent viewed posts');
      }),
      catchError((error) => {
        this.#recentViewedPostsSignal.set(previousPosts);
        return throwError(() => error);
      }),
    );
  }

  selectReaction(data: ReactionRequest): void {
    this.dropdownService.closeDropdown();

    if (!this.authService.isAuthenticated()) {
      this.modalService.showAuthRequiredModal();
      return;
    }

    this.reaction$.next(data);
  }

  toggleReactions(reactionData: ReactionRequest): Observable<Post> {
    const { post, data } = reactionData;
    const reactionId = data.reactionId;

    const previousPost: Post = {
      ...post,
      reactions: [...post.reactions],
      userReactionsIds: [...post.userReactionsIds],
    };

    const optimisticPost = this.applyOptimisticReaction(post, reactionId);
    this.updatePostsWithOptimisticData(post.id, optimisticPost);

    return this.http.post<Post>(`${this.apiUrl}/${post.id}/reaction`, data).pipe(
      tap((updatedPost) => {
        console.log('Post reaction updated successfully');
        this.updatePostsWithOptimisticData(post.id, updatedPost);
      }),
      catchError((error) => {
        console.error('Post reaction failed,rolling back to previous state', error);
        this.updatePostsWithOptimisticData(post.id, previousPost);
        return throwError(() => error);
      }),
    );
  }

  togglePostDetail(slug: string): void {
    this.dropdownService.closeDropdown();
    this.currentRouteService.handleRedirection(['/post', slug]);
  }

  hasReaction(userReactionsIds: number[], reactionId: number): boolean {
    return userReactionsIds.includes(reactionId);
  }

  updatePostDetailComment(commentId: string, updatedComment: Comment) {
    this.#postDetailSignal.update((post) => {
      if (!post.comments) return post;

      let oldComment: Comment | undefined;
      const updatedComments = post.comments.map((c) => {
        if (c.id === commentId) {
          oldComment = c;
          return updatedComment;
        }
        return c;
      });

      if (!oldComment) {
        return post;
      }

      const isDeleteOperation = updatedComment.isDeleted && !oldComment.isDeleted;

      return {
        ...post,
        comments: updatedComments,
        totalComment: isDeleteOperation ? post.totalComment - 1 : post.totalComment,
      };
    });
  }

  resetPostServiceData(): void {
    this.#recentViewedPostsSignal.set([]);
    this.#metadataSignal.set(undefined);
  }

  async handlePostShareAction(action: PostAction, post: Post): Promise<void> {
    const handler = this.shareActionHandlers.get(action);

    if (handler) {
      await handler(post);
      this.dropdownService.closeDropdown();
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

  private applyOptimisticReaction(post: Post, reactionId: number): Post {
    const isRemoving = post.userReactionsIds.includes(reactionId);

    const reactionsMap = new Map(post.reactions.map((r) => [r.reactionId, r.count]));

    let updatedUserReactionIds: number[];
    let updatedTotalReactions: number;

    if (isRemoving) {
      updatedUserReactionIds = post.userReactionsIds.filter((id) => id !== reactionId);
      updatedTotalReactions = post.totalReactions - 1;
      const currentCount = reactionsMap.get(reactionId);

      if (currentCount !== undefined) {
        if (currentCount <= 1) {
          reactionsMap.delete(reactionId);
        } else {
          reactionsMap.set(reactionId, currentCount - 1);
        }
      }
    } else {
      updatedUserReactionIds = [...post.userReactionsIds, reactionId];
      updatedTotalReactions = post.totalReactions + 1;
      const currentCount = reactionsMap.get(reactionId);

      if (currentCount !== undefined) {
        reactionsMap.set(reactionId, currentCount + 1);
      } else {
        reactionsMap.set(reactionId, 1);
      }
    }

    const updatedReactions = Array.from(reactionsMap.entries()).map(([reactionId, count]) => ({
      reactionId,
      count,
    }));

    return {
      ...post,
      reactions: updatedReactions,
      userReactionsIds: updatedUserReactionIds,
      totalReactions: updatedTotalReactions,
    };
  }

  private updatePostsWithOptimisticData(postId: string, updatedPost: Post): void {
    this.#postSignal.update((posts) => posts.map((p) => (p.id === postId ? updatedPost : p)));

    this.#postDetailSignal.update((currentPost) => {
      if (currentPost?.id === postId) {
        return updatedPost;
      }
      return currentPost;
    });
  }

  private removePostOptimistic(postId: string) {
    this.#postSignal.update((posts) => posts.filter((p) => p.id !== postId));

    this.#recentViewedPostsSignal.update((rp) => rp.filter((p) => p.postId !== postId));
  }

  private rollbackRemovePostOptimistic(index: number, post: Post) {
    const isPostInRecentView = this.#recentViewedPostsSignal().some((p) => p.postId === post.id);
    this.#postSignal.update((posts) => [...posts.slice(0, index), post, ...posts.slice(index)]);

    if (!isPostInRecentView) {
      return;
    } else {
      this.#recentViewedPostsSignal.update((rp) => [
        ...rp.slice(0, index),
        { postId: post.id, ...post },
        ...rp.slice(index),
      ]);
    }
  }
}
