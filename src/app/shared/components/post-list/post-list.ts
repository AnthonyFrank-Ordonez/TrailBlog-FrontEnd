import { Component, inject, signal } from '@angular/core';
import { PostCard } from './post-card/post-card';
import { ZardDividerComponent } from '../divider/divider.component';
import { PostService } from 'src/app/core/services/post.service';

@Component({
  selector: 'app-post-list',
  imports: [PostCard, ZardDividerComponent],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList {
  private readonly postService = inject(PostService);
  posts = this.postService.posts;

  isLoading = this.postService.isPostLoading;
  skeletonArray = Array(5).fill(0);
}
