import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';
import { handleHttpError } from '@shared/utils/utils';

@Component({
  selector: 'app-recent-viewed-post',
  imports: [ZardDividerComponent, TimeagoPipe, InitialsPipe],
  templateUrl: './recent-viewed-post.html',
  styleUrl: './recent-viewed-post.css',
})
export class RecentViewedPost {
  private readonly router = inject(Router);
  private readonly postService = inject(PostService);
  private readonly messageService = inject(MessageService);
  private readonly authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  recentViewedPosts = this.postService.recentViewedPosts;
  isAuthenticated = this.authService.isAuthenticated;
  isRecentLoading = this.postService.isRecentPostsLoading;

  skeletonArray = Array(10).fill(0);

  constructor() {
    effect(() => {
      const isAuth = this.isAuthenticated();

      if (isAuth) {
        this.loadRecentViewedPosts();
      }
    });
  }

  toggleRecentViewedPost(slug: string) {
    this.router.navigate(['/post', slug]);
  }

  handleClearRecentViewedPost() {
    this.postService
      .clearRecentViewedPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.showMessage('success', 'Recent viewed posts cleared successfully');
        },
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  private loadRecentViewedPosts() {
    this.postService
      .loadRecentViewedPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
