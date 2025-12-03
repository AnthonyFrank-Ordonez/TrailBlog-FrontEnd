import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiError } from '@core/models/interface/api-error';
import { CommentAction } from '@core/models/interface/comments';
import { ExploreMetadata, PostMetadata } from '@core/models/interface/page-result';
import { PostAction, PostLoadingStrategy } from '@core/models/interface/posts';
import { ReactionRequest } from '@core/models/interface/reactions';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { debounceTime, distinctUntilChanged, OperatorFunction, pipe, switchMap } from 'rxjs';

export const POST_PLACEHOLDER = {
  id: '',
  title: '',
  content: '',
  author: '',
  slug: '',
  createdAt: new Date(),
  username: '',
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
]);

export function debounce<T>(
  destroyRef: DestroyRef,
  debounceMs: number = 400,
): OperatorFunction<T, T> {
  return pipe(debounceTime(debounceMs), distinctUntilChanged(), takeUntilDestroyed(destroyRef));
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

export function getStrategyFromPath(path: string): PostLoadingStrategy {
  const strategyMap: Record<string, PostLoadingStrategy> = {
    '/': 'regular',
    '/popular': 'popular',
    '/explore': 'explore',
  };

  const strategy = strategyMap[path];

  if (!strategy) {
    console.warn(`Unknown Path: ${path}. Default to 'regular'`);
    return 'regular';
  }

  return strategy;
}

export function getActiveTabFromPath(path: string): string {
  if (path.startsWith('/popular')) return 'popular';
  if (path.startsWith('/create')) return 'create';
  if (path.startsWith('/communities')) return 'community';
  if (path.startsWith('/post/')) return 'post-detail';
  if (path.startsWith('/explore')) return 'explore';

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

export function isExploreMetadata(metadata: PostMetadata | undefined): metadata is ExploreMetadata {
  return (
    metadata !== undefined &&
    'allCommunitiesJoined' in metadata &&
    'code' in metadata &&
    'message' in metadata &&
    typeof metadata.allCommunitiesJoined === 'boolean' &&
    typeof metadata.code === 'string' &&
    typeof metadata.message === 'string'
  );
}
