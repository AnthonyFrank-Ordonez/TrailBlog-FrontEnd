import { DatePipe, NgClass } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Post } from '@core/models/interface/posts';
import { AuthService } from '@core/services/auth.service';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { ModalService } from '@core/services/modal.service';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { handleHttpError } from '@shared/utils/utils';

@Component({
  selector: 'app-post-card',
  imports: [
    DatePipe,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownDirective,
    NgClass,
    InitialsPipe,
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  userCommunities = this.communityService.userCommunities;
  post = input.required<Post>();
  modalConfig = this.modalService.modalConfig;

  get isJoined(): boolean {
    return this.userCommunities().some((uc) => uc.id === this.post().communityId);
  }

  toggleJoin(): void {
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
}
