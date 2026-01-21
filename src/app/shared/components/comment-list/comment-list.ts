import { Component, DestroyRef, effect, inject, untracked } from '@angular/core';
import { CommentCard } from './comment-card/comment-card';
import { CommentService } from '@core/services/comment.service';
import { getStrategyFromPath, handleHttpError } from '@shared/utils/utils';
import { CurrentRouteService } from '@core/services/current-route.service';
import { MessageService } from '@core/services/message.service';
import { CommentLoadingStrategy } from '@core/models/interface/comments';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '@core/services/auth.service';

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

  currentPath = this.currentRouteService.currentPath;
  token = this.authService.token;

  constructor() {
    effect(() => {
      const token = this.token();

      untracked(() => {
        this.loadComments();
      });
    });
  }

  loadComments() {
    const strategy = getStrategyFromPath(this.currentPath());
    console.log(strategy);

    this.commentService
      .loadInitialComments(strategy as CommentLoadingStrategy)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
