import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PostService } from '@core/services/post.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { InitialsPipe } from '@shared/pipes/initials-pipe';

@Component({
  selector: 'app-recent-viewed-post',
  imports: [ZardDividerComponent, DatePipe, InitialsPipe],
  templateUrl: './recent-viewed-post.html',
  styleUrl: './recent-viewed-post.css',
})
export class RecentViewedPost {
  private readonly postService = inject(PostService);

  posts = this.postService.posts;
  isRecentLoading = this.postService.isPostLoading;

  skeletonArray = Array(10).fill(0);
}
