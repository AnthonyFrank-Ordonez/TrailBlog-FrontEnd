import { Component, inject, signal } from '@angular/core';
import { CommunityCard } from './community-card/community-card';
import { CommunityService } from '@core/services/community.service';

@Component({
  selector: 'app-community-list',
  imports: [CommunityCard],
  templateUrl: './community-list.html',
  styleUrl: './community-list.css',
})
export class CommunityList {
  private readonly communityService = inject(CommunityService);

  userCommunities = this.communityService.userCommunities;
  communitiesLoading = this.communityService.userCommunitiesLoading;
  skeletonArray = Array(5).fill(0);
}
