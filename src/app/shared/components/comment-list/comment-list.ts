import { Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { CommentCard } from './comment-card/comment-card';
import { CommentService } from '@core/services/comment.service';
import { getStrategyFromPath, handleHttpError, SUCCESS_MESSAGES } from '@shared/utils/utils';
import { toCommentLoadingStrategy } from '@shared/utils/type-guards';
import { CurrentRouteService } from '@core/services/current-route.service';
import { MessageService } from '@core/services/message.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { Comment, CommentActionPayload } from '@core/models/interface/comments';
import { CommentMenuItems } from '@core/models/interface/menus';
import { UserService } from '@core/services/user.service';

@Component({
  selector: 'app-comment-list',
  imports: [CommentCard],
  templateUrl: './comment-list.html',
  styleUrl: './comment-list.css',
})
export class CommentList {
  private commentService = inject(CommentService);
  private currentRouteService = inject(CurrentRouteService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  comments = input.required<Comment[]>();
  skeletonArray = Array(5).fill(0);

  currentPath = this.currentRouteService.currentPath;
  token = this.authService.token;
  isCommentLoading = this.commentService.isCommentLoading;
  isAdmin = this.userService.isAdmin;
  hasMore = this.commentService.hasMore;

  readonly commentMenuItems: CommentMenuItems[] = [
    {
      type: 'comment',
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
      type: 'comment',

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
      action: 'initial-delete',
      fill: false,
    },
  ];

  // For testing comment skeleton loading
  // isCommentLoading = signal(true);

  constructor() {
    effect(() => {
      const token = this.token();
      const path = this.currentPath();

      if (path === '/profile#comments') {
        untracked(() => this.loadComments());
      }
    });
  }

  handleCommentDetailAction(comment: Comment) {
    const path = this.currentPath();

    if (path === '/profile#comments') {
      this.commentService.toggleCommentDetail(comment);
    }
  }

  handleCommentMenuAction(data: CommentActionPayload) {
    const event = data.clickEvent;
    const comment = data.comment;

    if (event.type !== 'comment') return;

    const handler = this.commentService.commentMenuActionHandlers.get(event.action);

    if (handler) {
      handler(comment)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            const message = SUCCESS_MESSAGES.get(event.action);
            this.messageService.showMessage('success', message);
          },
          error: (error: HttpErrorResponse) => {
            handleHttpError(error, this.messageService);
          },
        });
    } else {
      console.error('No handler found for action:', event.action);
    }
  }

  loadComments() {
    const strategy = toCommentLoadingStrategy(getStrategyFromPath(this.currentPath()));

    this.commentService
      .loadInitialComments(strategy)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
