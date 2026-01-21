import { ViewportScroller } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { PostLoadingStrategy } from '@core/models/interface/posts';
import { AuthService } from '@core/services/auth.service';
import { CommunityService } from '@core/services/community.service';
import { CurrentRouteService } from '@core/services/current-route.service';
import { MessageService } from '@core/services/message.service';
import { ModalService } from '@core/services/modal.service';
import { PostService } from '@core/services/post.service';
import { UserSettingsService } from '@core/services/user-settings.service';
import { UserService } from '@core/services/user.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { getStrategyFromPath, handleHttpError } from '@shared/utils/utils';

@Component({
  selector: 'app-side-navigation',
  imports: [RouterLink, InitialsPipe],
  templateUrl: './side-navigation.html',
  styleUrl: './side-navigation.css',
})
export class SideNavigation {
  private userSettingsService = inject(UserSettingsService);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private currentRouteService = inject(CurrentRouteService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private viewPortScroller = inject(ViewportScroller);

  private readonly MAX_COMMUNITIES_DISPLAY = 5;

  currentPath = this.currentRouteService.currentPath;
  activeTab = this.userService.activeUserTab;
  currentSettings = this.userSettingsService.userSettings;
  isAuthenticated = this.authService.isAuthenticated;
  userCommunities = this.communityService.userCommunities;
  userCommunitiesLoading = this.communityService.userCommunitiesLoading;

  skeletonArray = Array(3).fill(0);

  displayedCommunities = computed(() => {
    const communities = this.userCommunities();

    if (communities.length <= this.MAX_COMMUNITIES_DISPLAY) {
      return communities;
    }

    return communities.slice(0, this.MAX_COMMUNITIES_DISPLAY);
  });

  isCommunitiesExpanded = computed(() => {
    return this.currentSettings()?.communityExpanded;
  });

  isResourcesExpanded = computed(() => {
    return this.currentSettings()?.resourcesExpanded;
  });

  constructor() {
    effect(() => {
      if (this.isAuthenticated()) {
        this.loadCommunities();
      }
    });
  }

  toggleCommunities(): void {
    this.userSettingsService.updateUserSettings({
      communityExpanded: !this.currentSettings()?.communityExpanded,
    });
  }

  toggleResources(): void {
    this.userSettingsService.updateUserSettings({
      resourcesExpanded: !this.currentSettings()?.resourcesExpanded,
    });
  }

  showCommunityForm() {
    this.modalService.openModal({
      title: 'Tell us about your community',
      description:
        'A name and description help people understand what your community is all about.',
      content: 'community-form',
      type: 'form',
    });
  }

  toggleNavigation(targetPath: string) {
    if (this.currentPath() === targetPath) {
      this.viewPortScroller.scrollToPosition([0, 0]);

      const strategy = getStrategyFromPath(targetPath);

      this.postService
        .loadInitialPosts(strategy as PostLoadingStrategy)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: (error) => {
            handleHttpError(error, this.messageService);
          },
        });
    } else {
      this.router.navigate([targetPath]);
    }
  }

  private loadCommunities(): void {
    this.communityService
      .loadUserCommunities()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        error: (error: HttpErrorResponse) => {
          handleHttpError(error, this.messageService);
        },
      });
  }
}
