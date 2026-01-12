import { Component, inject } from '@angular/core';
import { PostList } from '../post-list/post-list';
import { PostService } from '@core/services/post.service';

@Component({
  selector: 'app-profile-view-history',
  imports: [PostList],
  templateUrl: './profile-view-history.html',
  styleUrl: './profile-view-history.css',
})
export class ProfileViewHistory {
  private postService = inject(PostService);

  viewHistory = this.postService.posts;
}
