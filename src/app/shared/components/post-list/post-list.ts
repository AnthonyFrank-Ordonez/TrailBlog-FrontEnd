import { Component, computed, DestroyRef, effect, inject, OnInit, signal } from '@angular/core';
import { PostCard } from './post-card/post-card';
import { PostService } from '@core/services/post.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { handleHttpError } from '@shared/utils/utils';
import { MessageService } from '@core/services/message.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-post-list',
  imports: [PostCard, ZardDividerComponent],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  private readonly postService = inject(PostService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  posts = this.postService.posts;

  isPostLoading = this.postService.isPostLoading;
  skeletonArray = Array(5).fill(0);

  constructor() {
    effect(() => {
      const isAuth = this.isAuthenticated();

      if (!isAuth) {
        this.loadPosts();
      }
    });
  }

  ngOnInit(): void {
    this.loadPosts();
  }

  private loadPosts() {
    this.postService
      .loadALlPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
