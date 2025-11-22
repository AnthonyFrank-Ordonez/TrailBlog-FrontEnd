import { NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ActionClickEvent,
  Post,
  PostActionPayload,
  PostDropdownItems,
} from '@core/models/interface/posts';
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

@Component({
  selector: 'app-post-card',
  imports: [TimeagoPipe, InitialsPipe, NgClass, DropdownMenu],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  @ViewChild('reactionContainer') reactionContainer!: ElementRef;
  @ViewChild('menuContainer') menuContainer!: ElementRef;
  @ViewChild('shareContainer') shareContainer!: ElementRef;

  private destroyRef = inject(DestroyRef);
  private postService = inject(PostService);
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);

  post = input.required<Post>();
  reactionList = input<ReactionList[]>([]);
  menuItems = input<PostDropdownItems[]>([]);
  shareItems = input<PostDropdownItems[]>([]);
  isUserJoined = input<boolean>(false);
  isPostMenuOpen = input<boolean>(false);
  isPostReactModalOpen = input<boolean>(false);
  isPostShareModalOpen = input<boolean>(false);
  postMenu = output<string>();
  reactModal = output<string>();
  shareModal = output<string>();
  copyAction = output<string>();
  shareAction = output<PostActionPayload>();
  postDetailAction = output<string>();

  isAuthenticated = this.authService.isAuthenticated;
  userCommunities = this.communityService.userCommunities;
  showReactionModal = signal<boolean>(false);
  modalConfig = this.modalService.modalConfig;
  postMenuModalId = this.postService.postMenuModalId;
  activeDropdown = this.postService.activeDropdown;

  handleMenuItems(event: MouseEvent) {
    event?.stopPropagation();

    this.postMenu.emit(this.post().id);
  }

  handleReactModal(event: MouseEvent) {
    event.stopPropagation();

    this.reactModal.emit(this.post().id);
  }

  handleShareModal(event: MouseEvent) {
    event.stopPropagation();

    this.shareModal.emit(this.post().id);
  }

  handleShareItemClick(data: ActionClickEvent) {
    data.event.stopPropagation();

    this.shareAction.emit({
      action: data.action,
      post: this.post(),
    });
  }

  handlePostDetailNavigate(event: MouseEvent) {
    event.stopPropagation();

    this.postDetailAction.emit(this.post().slug);
  }

  handleSelectReactionAction(reactionId: number, event: MouseEvent) {
    event.stopPropagation();

    const reactionRequest: ReactionRequest = {
      post: this.post(),
      data: { reactionId },
    };

    this.postService.selectReaction(reactionRequest);
  }

  // this part need refactoring
  toggleJoin(event?: MouseEvent): void {
    event?.stopPropagation();

    if (this.isUserJoined()) {
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
          // onConfirm: () => this.handleRedirection('login'),
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
  //

  hasReaction(reactionId: number): boolean {
    return this.postService.hasReaction(this.post().userReactionsIds, reactionId);
  }

  getReactionById(id: number): ReactionList | undefined {
    return this.postService.getReactionById(id);
  }
}
