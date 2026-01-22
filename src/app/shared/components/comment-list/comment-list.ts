import { Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { CommentCard } from './comment-card/comment-card';
import { CommentService } from '@core/services/comment.service';
import { getStrategyFromPath, handleHttpError } from '@shared/utils/utils';
import { toCommentLoadingStrategy } from '@shared/utils/type-guards';
import { CurrentRouteService } from '@core/services/current-route.service';
import { MessageService } from '@core/services/message.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';
import { Comment } from '@core/models/interface/comments';

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
  private destroyRef = inject(DestroyRef);

  comments = input.required<Comment[]>();
  skeletonArray = Array(5).fill(0);

  currentPath = this.currentRouteService.currentPath;
  token = this.authService.token;
  // For testing comment skeleton loading
  // isCommentLoading = signal(true);
  isCommentLoading = this.commentService.isCommentLoading;

  constructor() {
    effect(() => {
      const token = this.token();

      untracked(() => {
        this.loadComments();
      });
    });
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
