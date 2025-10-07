import { Component, inject } from '@angular/core';
import { ZardDividerComponent } from '../divider/divider.component';
import { DatePipe } from '@angular/common';
import { PostService } from 'src/app/core/services/post.service';
import { RecentView } from '../recent-view/recent-view';

@Component({
  selector: 'app-right-sidebar',
  imports: [RecentView],
  templateUrl: './right-sidebar.html',
  styleUrl: './right-sidebar.css',
})
export class RightSidebar {
  // private readonly postService = inject(PostService);
  // posts = this.postService.posts;
  // isLoading = this.postService.isPostLoading;
  // skeletonArray = Array(10).fill(0);
}
