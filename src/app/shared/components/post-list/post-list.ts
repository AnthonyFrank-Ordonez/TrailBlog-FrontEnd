import { Component, inject, OnInit, signal } from '@angular/core';
import { PostCard } from './post-card/post-card';
import { PostService } from '@core/services/post.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';

@Component({
  selector: 'app-post-list',
  imports: [PostCard, ZardDividerComponent],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  private readonly postService = inject(PostService);
  posts = this.postService.posts;

  isPostLoading = this.postService.isPostLoading;
  skeletonArray = Array(5).fill(0);

  ngOnInit(): void {
    this.postService.loadAllPosts();
  }
}
