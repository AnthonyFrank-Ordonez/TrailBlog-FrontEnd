import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
export class RecentViewedPost implements OnInit {
  private readonly postService = inject(PostService);
  private readonly messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);

  posts = this.postService.posts;
  recentViewedPosts = this.postService.recentViewedPosts;
  isRecentLoading = this.postService.isRecentPostsLoading;

  skeletonArray = Array(10).fill(0);

  ngOnInit(): void {
    this.loadRecentViewedPosts();
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
