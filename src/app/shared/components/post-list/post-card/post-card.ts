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
import { Post, ReactionType } from '@core/models/interface/posts';
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

  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private postService = inject(PostService);
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  private reaction$ = new Subject<ReactionRequest>();

  isAuthenticated = this.authService.isAuthenticated;
  userCommunities = this.communityService.userCommunities;
  post = input.required<Post>();
  modalConfig = this.modalService.modalConfig;
  showReactionModal = signal<boolean>(false);

  reactionList: ReactionList[] = [
    { id: 1, type: '😂', value: 'laughReact' },
    { id: 2, type: '🥲', value: 'sadReact' },
    { id: 3, type: '😡', value: 'angryReact' },
    { id: 4, type: '😍', value: 'loveReact' },
    { id: 5, type: '🚀', value: 'rocketReact' },
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

  togglePostDetail(slug: string) {
    this.router.navigate(['/post', slug]);

    this.userService.setActiveUserTab('post-detail');
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.showReactionModal()) return;

    const clickedInside = this.reactionContainer.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.closeReactModal();
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
}
