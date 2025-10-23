import {
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
  untracked,
} from '@angular/core';
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
export class PostList {
  private readonly postService = inject(PostService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  posts = this.postService.posts;

  isPostLoading = this.postService.isPostLoading;
  skeletonArray = Array(5).fill(0);
  hasMore = this.postService.hasMore;

  constructor() {
    effect(() => {
      const isAuth = this.isAuthenticated();

      untracked(() => {
        this.loadPosts();
      });
    });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    // Trigger at 80%
    const threshold = pageHeight * 1;

    if (scrollPosition >= threshold && this.hasMore()) {
      this.postService
        .loadMorePosts()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: (error) => {
            handleHttpError(error, this.messageService);
          },
        });
    }
  }

  private loadPosts() {
    this.postService
      .loadInitialPosts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
