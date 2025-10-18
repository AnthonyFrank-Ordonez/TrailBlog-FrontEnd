import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Communities } from '@core/models/interface/community';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { ModalService } from '@core/services/modal.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { handleHttpError } from '@shared/utils/utils';

@Component({
  selector: 'app-community-card',
  imports: [InitialsPipe],
  templateUrl: './community-card.html',
  styleUrl: './community-card.css',
})
export class CommunityCard {
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  community = input.required<Communities>();

  onLeaveCommunity(): void {
    this.modalService.openModal({
      type: 'community',
      title: 'Leave Community',
      description: 'Are you sure you want to leave this community?',
      content: 'leave-community',
      data: { communityId: this.community().id },
      onConfirm: (communityId) => this.leaveCommunity(communityId),
    });
  }

  leaveCommunity(communityId: string): void {
    this.communityService
      .leaveCommunity(communityId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
