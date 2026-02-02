import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ApiError } from '@core/models/interface/api-error';
import { CommentLoadingStrategy } from '@core/models/interface/comments';
import { CommentAction, PostAction } from '@core/models/interface/menus';
import { ExploreMetadata, MetaData } from '@core/models/interface/page-result';
import { PostLoadingStrategy } from '@core/models/interface/posts';
import { ReactionRequest } from '@core/models/interface/reactions';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { debounceTime, distinctUntilChanged, OperatorFunction, pipe, switchMap } from 'rxjs';

export const COMMUNITY_PLACEHOLDER = {
  id: '',
  communityName: '',
  description: '',
  communitySlug: '',
  owner: '',
  isFavorite: false,
  isUserJoined: false,
  totalMembers: 0,
  totalPosts: 0,
};

export const POST_PLACEHOLDER = {
  id: '',
  title: '',
  content: '',
  author: '',
  slug: '',
  createdAt: new Date(),
  username: '',
  community: COMMUNITY_PLACEHOLDER,
  communityName: '',
  communityId: '',
  isOwner: false,
  isSaved: false,
  totalComment: 0,
  comments: [],
  reactions: [],
  userReactionsIds: [],
  totalReactions: 0,
};

export const SUCCESS_MESSAGES = new Map<PostAction | CommentAction, string>([
  ['save', 'Post saved successfully!'],
  ['unsave', 'Post unsaved successfully!'],
  ['delete', 'Post deleted successfully!'],
  ['hide', 'Post hidden successfully!'],
  ['report', 'Post reported successfully!'],
  ['initial-delete', 'Successfully deleted comment!'],
  ['archive', 'Post archived successfully!'],
]);

export function debounce<T>(
  destroyRef: DestroyRef,
  debounceMs: number = 400,
): OperatorFunction<T, T> {
  return pipe(debounceTime(debounceMs), distinctUntilChanged(), takeUntilDestroyed(destroyRef));
}

export function debounceSignal<T>(signal: Signal<T>, time: number = 300): Signal<T | undefined> {
  let debounceObservable$ = toObservable(signal).pipe(debounceTime(time), distinctUntilChanged());

  return toSignal(debounceObservable$);
}

export function handleHttpError(error: HttpErrorResponse, messageService: MessageService) {
  if (error.error instanceof ErrorEvent) {
    messageService.showMessage('error', error.error.message);
    console.error(error.error.message);
  } else if (error.error && typeof error.error === 'object') {
    const apiError = error.error as ApiError;
    const errorMessage = apiError.detail ?? error.message;

    messageService.showMessage('error', errorMessage);
    console.error('An error occurred: ', apiError);
  } else {
    console.error('Http error occured: ', error);
  }
}

export function getStrategyFromPath(path: string): PostLoadingStrategy | CommentLoadingStrategy {
  const strategyMap: Record<string, PostLoadingStrategy | CommentLoadingStrategy> = {
    '/': 'regular',
    '/popular': 'popular',
    '/explore': 'explore',
    '/drafts': 'drafts',
    '/archives': 'archives',
    '/profile#posts': 'profile-posts',
    '/profile#saved': 'profile-saved',
    '/profile#comments': 'profile-comments',
    '/profile#history': 'profile-view-history',
  };

  const strategy = strategyMap[path];

  if (!strategy) {
    console.warn(`Unknown Path: ${path}. Default to 'regular'`);
    return 'regular';
  }

  return strategy;
}

export function getActiveTabFromPath(path: string): string {
  const onCommunityPage = /\/community\/[^\/]+/.test(path);

  if (path.startsWith('/popular')) return 'popular';
  if (path.startsWith('/create')) return 'create';
  if (path.startsWith('/communities')) return 'community';
  if (path.startsWith('/post/')) return 'post-detail';
  if (path.startsWith('/explore')) return 'explore';
  if (path.startsWith('/about')) return 'about';
  if (path.startsWith('/drafts')) return 'drafts';
  if (path.startsWith('/archives')) return 'archives';
  if (path.startsWith('/profile')) return 'profile';
  if (path.startsWith('/login')) return 'login';
  if (path.startsWith('/register')) return 'register';
  if (onCommunityPage) return 'community-detail';

  return 'home';
}

export function setupReactionSubject(
  postService: PostService,
  messageService: MessageService,
  destroyRef: DestroyRef,
) {
  postService.reaction$
    .pipe(
      debounce(destroyRef, 400),
      switchMap((reactionData: ReactionRequest) => postService.toggleReactions(reactionData)),
    )
    .subscribe({
      error: (error: HttpErrorResponse) => {
        handleHttpError(error, messageService);
      },
    });
}
