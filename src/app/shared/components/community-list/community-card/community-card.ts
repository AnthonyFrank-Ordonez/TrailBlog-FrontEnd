import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, inject, input, output } from '@angular/core';
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
  isFavorite = input<boolean>(false);
  toggleFavoriteAction = output<string>();
  leaveCommunityAction = output<string>();

  onLeaveCommunity(): void {
    this.leaveCommunityAction.emit(this.community().id);
  }

  toggleFavorite() {
    this.toggleFavoriteAction.emit(this.community().id);
  }
}
