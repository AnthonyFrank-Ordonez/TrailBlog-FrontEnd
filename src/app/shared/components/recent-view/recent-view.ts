import { Component, inject, OnInit, signal } from '@angular/core';
import { Blog } from 'src/app/core/models/interface/blogs';
import { ZardDividerComponent } from '../divider/divider.component';
import { DatePipe } from '@angular/common';
import { PostService } from 'src/app/core/services/post.service';

@Component({
  selector: 'app-recent-view',
  imports: [ZardDividerComponent, DatePipe],
  templateUrl: './recent-view.html',
  styleUrl: './recent-view.css',
})
export class RecentView implements OnInit {
  private readonly postService = inject(PostService);

  posts = this.postService.posts;
  isLoading = this.postService.isPostLoading;

  skeletonArray = Array(10).fill(0);

  ngOnInit(): void {
    this.postService.loadAllPosts();
  }
}
