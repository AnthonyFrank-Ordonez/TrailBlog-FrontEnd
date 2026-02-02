import { Component, inject } from '@angular/core';
import { PostService } from '@core/services/post.service';
import { PostList } from '../post-list/post-list';

@Component({
  selector: 'app-profile-posts',
  imports: [PostList],
  templateUrl: './profile-posts.html',
  styleUrl: './profile-posts.css',
})
export class ProfilePosts {
  private postService = inject(PostService);

  profilePosts = this.postService.posts;
  isProfilePostsLoading = this.postService.isPostLoading;
}
