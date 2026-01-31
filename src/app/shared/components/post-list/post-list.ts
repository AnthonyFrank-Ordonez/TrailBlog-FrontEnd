import {
  Component,
  DestroyRef,
  effect,
  HostListener,
  inject,
  input,
  OnInit,
  untracked,
} from '@angular/core';
import { PostCard } from './post-card/post-card';
import { PostService } from '@core/services/post.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  getStrategyFromPath,
  handleHttpError,
  setupReactionSubject,
  SUCCESS_MESSAGES,
} from '@shared/utils/utils';
import { MessageService } from '@core/services/message.service';
import { AuthService } from '@core/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Post, PostActionPayload, PostDeleteType } from '@core/models/interface/posts';
import { CurrentRouteService } from '@core/services/current-route.service';
import { CommunityService } from '@core/services/community.service';
import { MetaData } from '@core/models/interface/page-result';
import { NgOptimizedImage, ViewportScroller } from '@angular/common';
import { MenuItems, PostMenuItems } from '@core/models/interface/menus';
import { UserService } from '@core/services/user.service';
import { ModalService } from '@core/services/modal.service';
import {
  toMenuModalStrategy,
  toPostDeleteType,
  toPostLoadingStrategy,
} from '@shared/utils/type-guards';
import { DropdownService } from '@core/services/dropdown.service';

@Component({
  selector: 'app-post-list',
  imports: [PostCard, NgOptimizedImage],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private currentRouteService = inject(CurrentRouteService);
  private communityService = inject(CommunityService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private dropdownService = inject(DropdownService);
  private destroyRef = inject(DestroyRef);
  private viewportScroller = inject(ViewportScroller);

  posts = input.required<Post[]>();
  metadata = input<MetaData | undefined>();

  currentPath = this.currentRouteService.currentPath;
  isAuthenticated = this.authService.isAuthenticated;
  token = this.authService.token;
  userCommunities = this.communityService.userCommunities;
  isPostLoading = this.postService.isPostLoading;
  activeDropdown = this.dropdownService.activeDropdown;
  hasMore = this.postService.hasMore;
  reactionList = this.postService.getReactionList();
  skeletonArray = Array(5).fill(0);

  constructor() {
    effect(() => {
      const token = this.token();

      untracked(() => {
        this.loadPosts();
      });
    });
  }

  ngOnInit(): void {
    // Disable browser's automatic scroll restoration on reload
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    this.viewportScroller.scrollToPosition([0, 0]);
    setupReactionSubject(this.postService, this.messageService, this.destroyRef);
  }

  openPostMenu(postId: string) {
    this.dropdownService.toggleDropdown('menu', postId);
  }

  openReactModal(postId: string) {
    this.dropdownService.toggleDropdown('reaction', postId);
  }

  openShareModal(postId: string) {
    this.dropdownService.toggleDropdown('share', postId);
  }

  isUserInCommunity(communityId: string): boolean {
    return this.communityService.isUserInCommunity(communityId);
  }

  isPostMenuOpen(postId: string): boolean {
    return this.dropdownService.isDropDownOpen('menu', postId);
  }

  isPostReactModalOpen(postId: string): boolean {
    return this.dropdownService.isDropDownOpen('reaction', postId);
  }

  isPostShareModalOpen(postId: string): boolean {
    return this.dropdownService.isDropDownOpen('share', postId);
  }

  isExploreMetadata(metadata: MetaData | undefined): boolean {
    return this.isExploreMetadata(metadata);
  }

  handlePostMenuAction(data: PostActionPayload) {
    const activeTab = toPostDeleteType(this.userService.activeUserTab());
    const menuConfig = this.modalService.menuModalConfig[toMenuModalStrategy(data.action)];
    const handler = this.postService.postMenuActionHandlers.get(data.action);

    if (handler && (data.action === 'delete' || data.action === 'archive')) {
      this.dropdownService.closeDropdown();

      this.modalService.openModal({
        type: 'menu',
        title: menuConfig.title,
        description: menuConfig.description,
        confirmBtnText: menuConfig.confirmBtnText,
        cancelBtnText: menuConfig.cancelBtnText,
        subcontent: menuConfig.subcontent,
        content: 'confirmation-modal',
        data: { post: data.post, action: data.action, activeTab: activeTab },
        onConfirm: (post: Post, activeTab?: PostDeleteType) =>
          handler(post, activeTab)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: () => {
                const message = SUCCESS_MESSAGES.get(data.action);
                this.messageService.showMessage('success', message);
              },
              error: (error: HttpErrorResponse) => {
                handleHttpError(error, this.messageService);
              },
            }),
      });
    } else {
      if (handler) {
        handler(data.post, activeTab)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              const message = SUCCESS_MESSAGES.get(data.action);
              this.messageService.showMessage('success', message);
            },
            error: (error: HttpErrorResponse) => {
              handleHttpError(error, this.messageService);
            },
          });
      }
    }
  }

  handleGetPostMenuItems(post: Post): MenuItems[] {
    return this.postService.getMenuItems(post);
  }

  handleGetShareMenuItems(): MenuItems[] {
    return this.postService.getShareMenuItems();
  }

  async handleShareAction(data: PostActionPayload) {
    await this.postService.handlePostShareAction(data.action, data.post);
  }

  handleSave(event?: MouseEvent): void {
    event?.stopPropagation();

    console.info('Save button click');
  }

  handlePostDetail(slug: string) {
    this.postService.togglePostDetail(slug);
  }

  handleToggleJoin(communityId: string) {
    this.communityService.toggleCommunityMembership(communityId, this.isAuthenticated());
  }

  handlePublishDraftPost(post: Post) {
    this.postService
      .publishDraftPost(post)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.showMessage('success', 'Succesfully publish post');
        },
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const scrollPosition = window.pageYOffset + window.innerHeight;
    const pageHeight = document.documentElement.scrollHeight;

    const threshold = pageHeight * 1;
    const currentPath = this.currentPath();

    // Check if we're on a community-detail page
    const communityMatch = currentPath.match(/^\/community\/([^\/]+)/);

    // Use the appropriate hasMore signal based on the route
    const hasMoreToLoad = communityMatch ? this.communityService.hasMore() : this.hasMore();

    if (scrollPosition >= threshold && hasMoreToLoad) {
      if (communityMatch) {
        const slug = communityMatch[1];
        this.communityService
          .loadMoreCommunityPosts(slug)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: (error: HttpErrorResponse) => {
              handleHttpError(error, this.messageService);
            },
          });
      } else {
        this.postService
          .loadMorePosts()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: (error: HttpErrorResponse) => {
              handleHttpError(error, this.messageService);
            },
          });
      }
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const modal = this.dropdownService.activeDropdown();

    if (modal.type === null) return;

    const target = event.target as HTMLElement;

    const insideModal = target.closest('[data-modal-type]');
    const isButton = target.closest('.action-btn, button');

    if (!insideModal && !isButton) {
      this.dropdownService.closeDropdown();
    }
  }

  private loadPosts() {
    const strategy = toPostLoadingStrategy(getStrategyFromPath(this.currentPath()));

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
