import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import {
  Comment,
  CommentLoadingStrategy,
  CommentStrategyConfig,
} from '@core/models/interface/comments';
import { PageResult, MetaData } from '@core/models/interface/page-result';
import { environment } from '@env/environment';
import { catchError, EMPTY, finalize, Observable, tap, throwError } from 'rxjs';
import { CurrentRouteService } from './current-route.service';
import { CommentAction } from '@core/models/interface/menus';
import { OperationResult } from '@core/models/interface/operations';
import { DropdownService } from './dropdown.service';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  private env = environment;
  private readonly apiUrl = `${this.env.apiRoot}/comments`;
  private currentRouteService = inject(CurrentRouteService);
  private dropdownService = inject(DropdownService);
  private postService = inject(PostService);

  private http = inject(HttpClient);

  #commentsSignal = signal<Comment[]>([]);
  #currentPageSignal = signal<number>(0);
  #pageSizeSignal = signal<number>(10);
  #totalCountSignal = signal<number>(0);
  #sessionIdSignal = signal<string>('');
  #commentLoadingStrategySignal = signal<CommentLoadingStrategy>('profile-comments');
  #isCommentLoading = signal<boolean>(false);
  #totalPagesSignal = signal<number>(0);
  #errorMessageSignal = signal<string>('');
  #metadataSignal = signal<MetaData | null>(null);

  comments = this.#commentsSignal.asReadonly();
  isCommentLoading = this.#isCommentLoading.asReadonly();

  readonly hasMore = computed(() => {
    return this.#currentPageSignal() < this.#totalPagesSignal();
  });

  private readonly strategyConfig: Record<CommentLoadingStrategy, CommentStrategyConfig> = {
    'profile-comments': {
      endpoint: `${this.apiUrl}/user`,
      useSessionId: false,
    },
  };

  readonly commentMenuActionHandlers = new Map<
    CommentAction,
    (comment: Comment) => Observable<OperationResult>
  >([['initial-delete', (comment) => this.deleteCommentInitial(comment)]]);

  loadInitialComments(strategy: CommentLoadingStrategy) {
    this.#commentsSignal.set([]);
    this.#currentPageSignal.set(0);
    this.#sessionIdSignal.set('');
    this.#commentLoadingStrategySignal.set(strategy);

    return this.loadComments();
  }

  loadComments(): Observable<HttpResponse<PageResult<Comment>>> {
    if (this.#isCommentLoading()) {
      console.info('Already loading, skipping...');
      return EMPTY;
    }

    if (this.#currentPageSignal() > 0 && !this.hasMore()) {
      console.info('No more comments to load');
      return EMPTY;
    }

    this.#isCommentLoading.set(true);
    this.#errorMessageSignal.set('');

    const nextPage = this.#currentPageSignal() + 1;
    const strategy = this.#commentLoadingStrategySignal();
    const config = this.strategyConfig[strategy];

    let params = new HttpParams().set('page', nextPage).set('pageSize', this.#pageSizeSignal());

    if (config.useSessionId && this.#sessionIdSignal()) {
      params = params.set('sessionId', this.#sessionIdSignal());
    }

    return this.http
      .get<PageResult<Comment>>(config.endpoint, { params, observe: 'response' })
      .pipe(
        tap((result) => {
          const response = result.body!;

          if (config.useSessionId) {
            const sessionId = result.headers.get('X-Session-Id');

            if (sessionId) {
              this.#sessionIdSignal.set(sessionId);
            }
          }

          this.#commentsSignal.update((currentComments) => [...currentComments, ...response.data]);

          // Store metadata if available
          if (response.metadata) {
            this.#metadataSignal.set(response.metadata);
          }

          this.#totalCountSignal.set(response.totalCount);
          this.#totalPagesSignal.set(response.totalPages);
          this.#currentPageSignal.set(nextPage);
        }),
        catchError((error: HttpErrorResponse) => {
          this.#errorMessageSignal.set(error.error.message);
          return throwError(() => error);
        }),
        finalize(() => {
          this.#isCommentLoading.set(false);
        }),
      );
  }

  toggleCommentDetail(comment: Comment) {
    if (comment && comment.postSlug) {
      this.currentRouteService.handleRedirection(['/post', comment.postSlug], {
        fragment: `comment-${comment.id}`,
      });
    }
  }

  deleteCommentInitial(comment: Comment): Observable<OperationResult> {
    this.dropdownService.closeDropdown();

    const previousCommentState: Comment = comment;
    const optimisticComment: Comment = {
      ...comment,
      content: '[This comment has been deleted]',
      username: 'Unknown',
      isDeleted: true,
    };

    this.updatePostCommentOptimisticData(comment.id, optimisticComment);

    return this.http
      .patch<OperationResult>(`${this.env.apiRoot}/comments/${comment.id}`, null)
      .pipe(
        tap(() => {
          console.log('Comment deleted successfully');
        }),
        catchError((error) => {
          console.error('Delete comment failed, rolling back', error);
          this.updatePostCommentOptimisticData(comment.id, previousCommentState);
          return throwError(() => error);
        }),
      );
  }

  private updatePostCommentOptimisticData(commentId: string, updatedComment: Comment) {
    this.postService.updatePostDetailComment(commentId, updatedComment);
  }
}
