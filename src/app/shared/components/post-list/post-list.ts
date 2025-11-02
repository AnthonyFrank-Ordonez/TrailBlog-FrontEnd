import {
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  input,
  OnInit,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { PostCard } from './post-card/post-card';
import { PostService } from '@core/services/post.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { handleHttpError } from '@shared/utils/utils';
import { MessageService } from '@core/services/message.service';
import { AuthService } from '@core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Post } from '@core/models/interface/posts';

@Component({
  selector: 'app-post-list',
  imports: [PostCard, ZardDividerComponent],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList {
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  posts = input.required<Post[]>();

  currentPath: Signal<string>;
  isAuthenticated = this.authService.isAuthenticated;

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

    this.currentPath = toSignal(
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url),
        startWith(this.router.url),
      ),
      { initialValue: this.router.url },
    );
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
    switch (this.currentPath()) {
      case '/':
        this.postService
          .loadInitialPosts('regular')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: (error: HttpErrorResponse) => {
              handleHttpError(error, this.messageService);
            },
          });
        break;
      case '/popular':
        this.postService
          .loadInitialPosts('popular')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: (error: HttpErrorResponse) => {
              handleHttpError(error, this.messageService);
            },
          });
        break;
      default:
        break;
    }
  }
}
