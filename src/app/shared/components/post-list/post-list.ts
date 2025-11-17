import {
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  input,
  linkedSignal,
  OnInit,
  Signal,
  signal,
  untracked,
} from '@angular/core';
import { PostCard } from './post-card/post-card';
import { PostService } from '@core/services/post.service';
import { ZardDividerComponent } from '@shared/components/divider/divider.component';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { getStrategyFromPath, handleHttpError } from '@shared/utils/utils';
import { MessageService } from '@core/services/message.service';
import { AuthService } from '@core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { Post, PostLoadingStrategy } from '@core/models/interface/posts';
import { CurrentRouteService } from '@core/services/current-route.service';
import { CommunityService } from '@core/services/community.service';

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
  private currentRouteService = inject(CurrentRouteService);
  private communityService = inject(CommunityService);
  private destroyRef = inject(DestroyRef);

  posts = input.required<Post[]>();

  currentPath = this.currentRouteService.currentPath;
  isAuthenticated = this.authService.isAuthenticated;
  token = this.authService.token;
  userCommunities = this.communityService.userCommunities;
  isPostLoading = this.postService.isPostLoading;
  activeDropdown = this.postService.activeDropdown;
  skeletonArray = Array(5).fill(0);
  hasMore = this.postService.hasMore;

  userCommunityIds = linkedSignal(() => {
    return new Set(this.userCommunities().map((uc) => uc.id));
  });

  constructor() {
    effect(() => {
      const token = this.token();

      untracked(() => {
        this.loadPosts();
      });
    });
  }

  openPostMenu(postId: string) {
    if (this.isPostMenuOpen(postId)) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('menu', postId);
  }

  openReactModal(postId: string) {
    console.log('here');
    if (this.isPostReactModalOpen(postId)) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('reaction', postId);
  }

  isUserInCommunity(communityId: string): boolean {
    return this.userCommunityIds().has(communityId);
  }

  isPostMenuOpen(postId: string): boolean {
    const active = this.activeDropdown();
    return active.type === 'menu' && active.id === postId;
  }

  isPostReactModalOpen(postId: string): boolean {
    const active = this.activeDropdown();
    return active.type === 'reaction' && active.id === postId;
  }

  isPostShareModalOpen(postId: string): boolean {
    const active = this.activeDropdown();
    return active.type === 'share' && active.id === postId;
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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const modal = this.postService.activeDropdown();

    if (modal.type === null) return;

    const target = event.target as HTMLElement;

    const insideModal = target.closest('[data-modal-type]');
    const isButton = target.closest('.action-btn, .post-actions button');

    if (!insideModal && !isButton) {
      console.log('Clicked Outside!');
      this.postService.closeDropdown();
    }
  }

  private loadPosts() {
    const strategy = getStrategyFromPath(this.currentPath());

    this.postService
      .loadInitialPosts(strategy)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
