import { DatePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Post, PostMenuItems, ReactionType } from '@core/models/interface/posts';
import { ReactionList, ReactionRequest } from '@core/models/interface/reactions';
import { AuthService } from '@core/services/auth.service';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { ModalService } from '@core/services/modal.service';
import { PostService } from '@core/services/post.service';
import { UserService } from '@core/services/user.service';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';
import { handleHttpError } from '@shared/utils/utils';
import { debounceTime, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-post-card',
  imports: [
    TimeagoPipe,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownDirective,
    NgClass,
    InitialsPipe,
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard implements OnInit {
  @ViewChild('reactionContainer') reactionContainer!: ElementRef;
  @ViewChild('menuContainer') menuContainer!: ElementRef;

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
  modalConfig = this.modalService.modalConfig;
  showReactionModal = signal<boolean>(false);
  showMenuModal = signal<boolean>(false);
  postMenuModalId = this.postService.postMenuModalId;

  readonly reactionList: ReactionList[] = [
    { id: 1, type: '😂', value: 'laughReact' },
    { id: 2, type: '🥲', value: 'sadReact' },
    { id: 3, type: '😡', value: 'angryReact' },
    { id: 4, type: '😍', value: 'loveReact' },
    { id: 5, type: '🚀', value: 'rocketReact' },
  ];

  readonly menuItems: PostMenuItems[] = [
    {
      label: 'Save',
      iconClass: 'icon-tabler-bookmark',
      svgPath: ['M18 7v14l-6 -4l-6 4v-14a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z'],
      action: (event?: MouseEvent) => this.handleSave(event),
      ownerOnly: false,
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
      this.modalService.openModal({
        type: 'community',
        title: 'Leave Community',
        description: 'Are you sure you want to leave this community?',
        content: 'leave-community',
        data: { communityId: this.post().communityId },
        onConfirm: (communityId) => this.onLeaveConfirmed(communityId),
      });
    } else {
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

    if (this.showReactionModal()) {
      this.closeReactModal();
    }

    this.showReactionModal.set(true);
  }

  toggleMenuItems(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.postMenuModalId() === this.post().id) {
      this.closeMenuModal();
    }

    this.postService.updatePostMenuModalId(this.post().id);
  }

  selectReaction(reactionId: number, event?: MouseEvent): void {
    event?.stopPropagation();

    const reactionData = {
      reactionId: reactionId,
    };

    this.reaction$.next(reactionData);

    this.closeReactModal();
  }

  closeReactModal(): void {
    setTimeout(() => {
      this.showReactionModal.set(false);
    }, 200);
  }

  closeMenuModal() {
    setTimeout(() => {
      this.postService.updatePostMenuModalId(null);
    }, 200);
  }

  togglePostDetail(slug: string) {
    this.router.navigate(['/post', slug]);
  }

  handleSave(event?: MouseEvent): void {
    event?.stopPropagation();

    console.info('Save button click');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.reactionContainer || !this.menuContainer) return;

    const insideReactModal = this.reactionContainer.nativeElement.contains(event.target);
    const insideMenuModal = this.menuContainer.nativeElement.contains(event.target);

    if (this.showReactionModal() && !insideReactModal) {
      this.closeReactModal();
    }

    if (this.postMenuModalId() && !insideMenuModal) {
      this.closeMenuModal();
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

  get filteredMenuItems() {
    return this.menuItems.filter((item) => !item.ownerOnly || this.post().isOwner);
  }

  get isPostMenuOpen() {
    return this.postMenuModalId() === this.post().id;
  }
}
