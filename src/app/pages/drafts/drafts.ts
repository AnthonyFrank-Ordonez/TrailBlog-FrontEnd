import { Component, inject } from '@angular/core';
import { PostService } from '@core/services/post.service';
import { PostList } from '@shared/components/post-list/post-list';

@Component({
  selector: 'app-drafts',
  imports: [PostList],
  templateUrl: './drafts.html',
  styleUrl: './drafts.css',
})
export class Drafts {
  private postService = inject(PostService);

  draftPosts = this.postService.posts;
}
