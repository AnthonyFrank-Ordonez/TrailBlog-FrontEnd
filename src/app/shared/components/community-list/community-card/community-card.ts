import { Component, input } from '@angular/core';
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
}
