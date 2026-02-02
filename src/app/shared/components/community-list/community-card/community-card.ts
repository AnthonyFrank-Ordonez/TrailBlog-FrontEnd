import { Component, input, output } from '@angular/core';
import { Communities } from '@core/models/interface/community';
import { InitialsPipe } from '@shared/pipes/initials-pipe';

@Component({
  selector: 'app-community-card',
  imports: [InitialsPipe],
  templateUrl: './community-card.html',
  styleUrl: './community-card.css',
})
export class CommunityCard {
  community = input.required<Communities>();
  isFavorite = input<boolean>(false);
  toggleFavoriteAction = output<Communities>();
  leaveCommunityAction = output<Communities>();

  onLeaveCommunity(): void {
    this.leaveCommunityAction.emit(this.community());
  }

  toggleFavorite() {
    this.toggleFavoriteAction.emit(this.community());
  }
}
