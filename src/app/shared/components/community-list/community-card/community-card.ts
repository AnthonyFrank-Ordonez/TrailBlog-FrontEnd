import { Component, input } from '@angular/core';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { UserCommunities } from 'src/app/core/models/interface/community';

@Component({
  selector: 'app-community-card',
  imports: [InitialsPipe],
  templateUrl: './community-card.html',
  styleUrl: './community-card.css',
})
export class CommunityCard {
  community = input.required<UserCommunities>();
}
