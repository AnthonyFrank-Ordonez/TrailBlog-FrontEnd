import { Component, computed, DestroyRef, inject, input, linkedSignal } from '@angular/core';
import { CommunityCard } from './community-card/community-card';
import { CommunityService } from '@core/services/community.service';
import { Communities } from '@core/models/interface/community';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { handleHttpError } from '@shared/utils/utils';
import { MessageService } from '@core/services/message.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-community-list',
  imports: [CommunityCard],
  templateUrl: './community-list.html',
  styleUrl: './community-list.css',
})
export class CommunityList {
  private communityService = inject(CommunityService);
  private destroyRef = inject(DestroyRef);
  private messageService = inject(MessageService);
  private authService = inject(AuthService);

  userCommunities = input.required<Communities[]>();
  isAuthenticated = this.authService.isAuthenticated;
  communitiesLoading = this.communityService.userCommunitiesLoading;
  communityFilter = this.communityService.communityFilter;
  skeletonArray = Array(5).fill(0);

  userCommunitiesFavorite = linkedSignal(
    () =>
      new Map<string, Communities>(
        this.userCommunities()
          .filter((uc) => uc.isFavorite)
          .map((uc) => [uc.id, uc]),
      ),
  );

  filteredUserCommunities = computed(() => {
    const userCommunities = this.userCommunities();
    const filter = this.communityFilter();

    if (filter === 'All') {
      return userCommunities;
    }

    return [...this.userCommunitiesFavorite().values()];
  });

  handleLeaveCommunity(communityId: string) {
    this.communityService.toggleCommunityMembership(communityId, this.isAuthenticated());
  }

  handleCommunityFavorite(community: Communities) {
    if (this.isCommunityFavorite(community.id)) {
      this.handleUnfavoriteCommunity(community);
    } else {
      this.handleFavoriteCommunity(community);
    }
  }

  handleFavoriteCommunity(community: Communities) {
    this.communityService
      .favoriteCommunity(community)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  handleUnfavoriteCommunity(community: Communities) {
    this.communityService
      .unfavoriteCommunity(community)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }

  isCommunityFavorite(communityId: string) {
    return this.userCommunitiesFavorite().has(communityId);
  }
}
