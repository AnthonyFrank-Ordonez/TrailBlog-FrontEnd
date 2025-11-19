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
import { debounceTime, filter, map, startWith, Subject, switchMap } from 'rxjs';
import {
  Post,
  PostAction,
  PostActionPayload,
  PostDropdownItems,
  PostLoadingStrategy,
} from '@core/models/interface/posts';
import { CurrentRouteService } from '@core/services/current-route.service';
import { CommunityService } from '@core/services/community.service';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { ModalService } from '@core/services/modal.service';

@Component({
  selector: 'app-post-list',
  imports: [PostCard, ZardDividerComponent],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  private postService = inject(PostService);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);
  private currentRouteService = inject(CurrentRouteService);
  private communityService = inject(CommunityService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  posts = input.required<Post[]>();
  private reaction$ = new Subject<ReactionRequest>();

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

  readonly reactionList: ReactionList[] = [
    { id: 1, type: '😂', value: 'laughReact' },
    { id: 2, type: '🥲', value: 'sadReact' },
    { id: 3, type: '😡', value: 'angryReact' },
    { id: 4, type: '😍', value: 'loveReact' },
    { id: 5, type: '🚀', value: 'rocketReact' },
  ];

  readonly menuItems: PostDropdownItems[] = [
    {
      label: 'Save',
      iconClass: 'icon-tabler-bookmark',
      svgPath: ['M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z'],
      ownerOnly: false,
      forAuthenticated: true,
      hideForOwner: false,
      action: 'save',
    },
    {
      label: 'Hide',
      iconClass: 'icon-tabler-eye-off',
      svgPath: [
        'M10.585 10.587a2 2 0 0 0 2.829 2.828',
        'M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87',
        'M3 3l18 18',
      ],
      ownerOnly: false,
      forAuthenticated: true,
      hideForOwner: false,
      action: 'hide',
    },
    {
      label: 'Report',
      iconClass: 'icon-tabler-message-report',
      svgPath: [
        'M18 4a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-5l-5 3v-3h-2a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12z',
        'M12 8v3',
        'M12 14v.01',
      ],
      ownerOnly: false,
      forAuthenticated: false,
      hideForOwner: true,
      action: 'report',
    },
    {
      label: 'Delete',
      iconClass: 'icon-tabler-trash',
      svgPath: [
        'M4 7l16 0',
        'M10 11l0 6',
        'M14 11l0 6',
        'M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12',
        'M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3',
      ],
      ownerOnly: true,
      forAuthenticated: true,
      hideForOwner: false,
      action: 'delete',
    },
  ];

  readonly shareItems: PostDropdownItems[] = [
    {
      label: 'Copy',
      iconClass: 'icon-tabler-clipboard',
      svgPath: [
        'M17.997 4.17a3 3 0 0 1 2.003 2.83v12a3 3 0 0 1 -3 3h-10a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 2.003 -2.83a4 4 0 0 0 3.997 3.83h4a4 4 0 0 0 3.98 -3.597zm-3.997 -2.17a2 2 0 1 1 0 4h-4a2 2 0 1 1 0 -4z',
      ],
      ownerOnly: false,
      forAuthenticated: false,
      action: 'copy',
    },
    {
      label: 'Embed',
      iconClass: 'icon-tabler-file-code-2',
      svgPath: [
        'M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2 9h-1a1 1 0 0 0 -1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007v-3a1 1 0 0 0 0 -2m5 0h-1a1 1 0 0 0 0 2v3a1 1 0 0 0 0 2h1a1 1 0 0 0 1 -1v-5a1 1 0 0 0 -1 -1m-.001 -8.001l4.001 4.001h-4z',
      ],
      ownerOnly: false,
      forAuthenticated: false,
      action: 'embed',
    },
  ];

  constructor() {
    effect(() => {
      const token = this.token();

      untracked(() => {
        this.loadPosts();
      });
    });
  }

  ngOnInit(): void {
    this.reaction$
      .pipe(
        debounceTime(600),
        takeUntilDestroyed(this.destroyRef),
        switchMap((reactionData: ReactionRequest) =>
          this.postService.toggleReactions(reactionData),
        ),
      )
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  openPostMenu(postId: string) {
    this.postService.toggleDropdown('menu', postId);
  }

  openReactModal(postId: string) {
    this.postService.toggleDropdown('reaction', postId);
  }

  openShareModal(postId: string) {
    this.postService.toggleDropdown('share', postId);
  }

  isUserInCommunity(communityId: string): boolean {
    return this.userCommunityIds().has(communityId);
  }

  isPostMenuOpen(postId: string): boolean {
    return this.postService.isDropDownOpen('menu', postId);
  }

  isPostReactModalOpen(postId: string): boolean {
    return this.postService.isDropDownOpen('reaction', postId);
  }

  isPostShareModalOpen(postId: string): boolean {
    return this.postService.isDropDownOpen('share', postId);
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

  handleSelectReaction(data: ReactionRequest) {
    if (!this.isAuthenticated()) {
      this.modalService.openModal({
        type: 'error',
        title: 'Oops, Something wen’t wrong',
        description: 'Unable to process your request',
        content: 'error-modal',
        subcontent:
          'You need to login first before you can use this react button for post, The login button will redirect you to the login page',
        confirmBtnText: 'Login',

        cancelBtnText: 'Cancel',
        onConfirm: () => this.currentRouteService.handleRedirection('/login'),
      });
      this.postService.closeDropdown();
      return;
    } else {
      this.reaction$.next(data);
      this.postService.closeDropdown();
    }
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
