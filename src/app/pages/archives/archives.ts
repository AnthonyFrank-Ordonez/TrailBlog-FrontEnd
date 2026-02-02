import { Component, inject } from '@angular/core';
import { PostService } from '@core/services/post.service';
import { PostList } from '@shared/components/post-list/post-list';

@Component({
  selector: 'app-archives',
  imports: [PostList],
  templateUrl: './archives.html',
  styleUrl: './archives.css',
})
export class Archives {
  private postService = inject(PostService);

  archivedPosts = this.postService.posts;
  isArchivedPostsLoading = this.postService.isPostLoading;
}
