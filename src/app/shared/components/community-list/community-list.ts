import { Component, computed, inject, signal } from '@angular/core';
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
  communityFilter = this.communityService.communityFilter;
  skeletonArray = Array(5).fill(0);

  filteredUserCommunities = computed(() => {
    const userCommunities = this.userCommunities();
    const filter = this.communityFilter();

    if (filter === 'All') {
      return userCommunities;
    }

    return userCommunities.filter((uc) => uc.isFavorite);
  });
}
