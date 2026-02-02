import { Component, inject } from '@angular/core';
import { PostService } from '@core/services/post.service';
import { PostList } from '../post-list/post-list';

@Component({
  selector: 'app-profile-saved',
  imports: [PostList],
  templateUrl: './profile-saved.html',
  styleUrl: './profile-saved.css',
})
export class ProfileSaved {
  private postService = inject(PostService);

  savedPosts = this.postService.posts;
  isSavedPostsLoading = this.postService.isPostLoading;
}
