import { DatePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Post, PostDropdownItems } from '@core/models/interface/posts';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AuthService } from '@core/services/auth.service';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { ModalService } from '@core/services/modal.service';
import { PostService } from '@core/services/post.service';
import { DropdownMenu } from '@shared/components/dropdown-menu/dropdown-menu';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';
import { handleHttpError } from '@shared/utils/utils';
import { debounceTime, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-post-card',
  imports: [TimeagoPipe, InitialsPipe, NgClass, DropdownMenu],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard implements OnInit {
  @ViewChild('reactionContainer') reactionContainer!: ElementRef;
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('shareContainer') shareContainer!: ElementRef;

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private postService = inject(PostService);
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);

  private reaction$ = new Subject<ReactionRequest>();

  isAuthenticated = this.authService.isAuthenticated;
  userCommunities = this.communityService.userCommunities;
  post = input.required<Post>();
  showReactionModal = signal<boolean>(false);
  modalConfig = this.modalService.modalConfig;
  postMenuModalId = this.postService.postMenuModalId;
  activeDropdown = this.postService.activeDropdown;

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
      action: (event?: MouseEvent) => this.handleSave(event),
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
      action: (event?: MouseEvent) => this.handleSave(event),
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
      action: (event?: MouseEvent) => this.handleSave(event),
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
      action: (event?: MouseEvent) => this.handleSave(event),
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
      action: (event?: MouseEvent) => this.handleCopy(event),
    },
    {
      label: 'Embed',
      iconClass: 'icon-tabler-file-code-2',
      svgPath: [
        'M12 2l.117 .007a1 1 0 0 1 .876 .876l.007 .117v4l.005 .15a2 2 0 0 0 1.838 1.844l.157 .006h4l.117 .007a1 1 0 0 1 .876 .876l.007 .117v9a3 3 0 0 1 -2.824 2.995l-.176 .005h-10a3 3 0 0 1 -2.995 -2.824l-.005 -.176v-14a3 3 0 0 1 2.824 -2.995l.176 -.005zm-2 9h-1a1 1 0 0 0 -1 1v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1 -1l-.007 -.117a1 1 0 0 0 -.876 -.876l-.117 -.007v-3a1 1 0 0 0 0 -2m5 0h-1a1 1 0 0 0 0 2v3a1 1 0 0 0 0 2h1a1 1 0 0 0 1 -1v-5a1 1 0 0 0 -1 -1m-.001 -8.001l4.001 4.001h-4z',
      ],
      ownerOnly: false,
      forAuthenticated: false,
      action: (event?: MouseEvent) => this.handleSave(event),
    },
  ];

  ngOnInit(): void {
    this.reaction$
      .pipe(
        debounceTime(600),
        takeUntilDestroyed(this.destroyRef),
        switchMap((reactionData: ReactionRequest) =>
          this.postService.toggleReactions(this.post().id, reactionData),
        ),
      )
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  toggleJoin(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.isJoined) {
      this.postService.closeDropdown();

      this.modalService.openModal({
        type: 'community',
        title: 'Leave Community',
        description: 'Are you sure you want to leave this community?',
        content: 'confirmation-modal',
        subcontent:
          ' Once you leave, you’ll no longer be a member or receive updates from this community. You can rejoin anytime.',
        confirmBtnText: 'Leave Community',
        cancelBtnText: 'Cancel',
        data: { communityId: this.post().communityId },
        onConfirm: (communityId) => this.onLeaveConfirmed(communityId),
      });
    } else {
      this.postService.closeDropdown();

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
          onConfirm: () => this.handleRedirection('login'),
        });
        return;
      }

      this.joinCommunity(this.post().communityId);
    }
  }

  onLeaveConfirmed(communityId: string): void {
    this.communityService
      .leaveCommunity(communityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  joinCommunity(communityId: string): void {
    this.communityService
      .joinCommunity(communityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  toggleReactionModal(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.isPostReactModalOpen) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('reaction', this.post().id);
  }

  toggleMenuItems(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.isPostMenuOpen) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('menu', this.post().id);
  }

  toggleShareItems(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.isShareModalOpen) {
      this.postService.closeDropdown();
      return;
    }

    this.postService.updateActiveDropdown('share', this.post().id);
  }

  selectReaction(reactionId: number, event?: MouseEvent): void {
    event?.stopPropagation();

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
        onConfirm: () => this.handleRedirection('/login'),
      });
      this.postService.closeDropdown();
      return;
    }

    const reactionData = {
      reactionId: reactionId,
    };

    this.reaction$.next(reactionData);

    this.postService.closeDropdown();
  }

  togglePostDetail(slug: string) {
    this.postService.closeDropdown();
    this.router.navigate(['/post', slug]);
  }

  handleSave(event?: MouseEvent): void {
    event?.stopPropagation();

    console.info('Save button click');
  }

  handleRedirection(path: string): void {
    this.router.navigate([path]);
  }

  async handleCopy(event?: MouseEvent) {
    event?.stopPropagation();
    const url = `${window.location.origin}/post/${this.post().slug}`;

    await this.postService.copyPostLink(url);
    this.postService.closeDropdown();
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.reactionContainer || !this.menuContainer || !this.shareContainer) return;

    const insideReactModal = this.reactionContainer.nativeElement.contains(event.target);
    const insideMenuModal = this.menuContainer.nativeElement.contains(event.target);
    const insideShareModal = this.shareContainer.nativeElement.contains(event.target);

    if (this.isPostReactModalOpen && !insideReactModal) {
      this.postService.closeDropdown();
    }

    if (this.isPostMenuOpen && !insideMenuModal) {
      this.postService.closeDropdown();
    }

    if (this.isShareModalOpen && !insideShareModal) {
      this.postService.closeDropdown();
    }
  }

  hasReaction(reactionId: number): boolean {
    return this.post().userReactionsIds.includes(reactionId);
  }

  getReactionById(id: number): ReactionList | undefined {
    return this.reactionList.find((r) => r.id === id);
  }

  get isJoined(): boolean {
    return this.userCommunities().some((uc) => uc.id === this.post().communityId);
  }

  get isPostMenuOpen() {
    const active = this.activeDropdown();
    return active.type === 'menu' && active.id === this.post().id;
  }

  get isPostReactModalOpen() {
    const active = this.activeDropdown();
    return active.type === 'reaction' && active.id === this.post().id;
  }

  get isShareModalOpen() {
    const active = this.activeDropdown();
    return active.type === 'share' && active.id === this.post().id;
  }
}
