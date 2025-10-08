import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { PostService } from 'src/app/core/services/post.service';

@Component({
  selector: 'app-recent-viewed-post',
  imports: [ZardDividerComponent, DatePipe],
  templateUrl: './recent-viewed-post.html',
  styleUrl: './recent-viewed-post.css',
})
export class RecentViewedPost {
  private readonly postService = inject(PostService);

  posts = this.postService.posts;
  isRecentLoading = this.postService.isPostLoading;

  skeletonArray = Array(10).fill(0);
}
