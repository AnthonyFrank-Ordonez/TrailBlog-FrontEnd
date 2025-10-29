import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { MessageService } from '@core/services/message.service';
import { PostService } from '@core/services/post.service';
import { UserService } from '@core/services/user.service';
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
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  posts = this.postService.posts;
  recentViewedPosts = this.postService.recentViewedPosts;
  isRecentLoading = this.postService.isRecentPostsLoading;
  isAuthenticated = this.authService.isAuthenticated;

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

    this.userService.setActiveUserTab('post-detail');
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
