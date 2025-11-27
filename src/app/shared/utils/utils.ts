import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiError } from '@core/models/interface/api-error';
import { PostAction, PostLoadingStrategy } from '@core/models/interface/posts';
import { ReactionRequest } from '@core/models/interface/reactions';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { debounceTime, switchMap } from 'rxjs';

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

export const SUCCESS_MESSAGES = new Map<PostAction, string>([
  ['save', 'Post saved successfully!'],
  ['unsave', 'Post unsaved successfully!'],
  ['delete', 'Post deleted successfully!'],
  ['hide', 'Post hidden successfully!'],
  ['report', 'Post reported successfully!'],
]);

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

  return 'home';
}

export function setupReactionSubject(
  postService: PostService,
  messageService: MessageService,
  destroyRef: DestroyRef,
) {
  postService.reaction$
    .pipe(
      debounceTime(300),
      takeUntilDestroyed(destroyRef),
      switchMap((reactionData: ReactionRequest) => postService.toggleReactions(reactionData)),
    )
    .subscribe({
      error: (error: HttpErrorResponse) => {
        handleHttpError(error, messageService);
      },
    });
}
