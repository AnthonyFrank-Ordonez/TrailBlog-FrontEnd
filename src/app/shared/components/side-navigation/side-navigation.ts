import { ViewportScroller } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, DestroyRef, effect, inject, Signal, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { ModalService } from '@core/services/modal.service';
import { PostService } from '@core/services/post.service';
import { UserSettingsService } from '@core/services/user-settings.service';
import { UserService } from '@core/services/user.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { handleHttpError } from '@shared/utils/utils';
import { filter, map, startWith, tap } from 'rxjs';

@Component({
  selector: 'app-side-navigation',
  imports: [RouterLink, InitialsPipe],
  templateUrl: './side-navigation.html',
  styleUrl: './side-navigation.css',
  animations: [],
})
export class SideNavigation {
  private userSettingsService = inject(UserSettingsService);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private viewPortScroller = inject(ViewportScroller);

  private readonly MAX_COMMUNITIES_DISPLAY = 5;

  currentPath: Signal<string>;
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

  constructor() {
    effect(() => {
      if (this.isAuthenticated()) {
        this.loadCommunities();
      }
    });

    this.currentPath = toSignal(
      this.router.events.pipe(
        filter((event) => event instanceof NavigationEnd),
        map((event: NavigationEnd) => event.url),
        startWith(this.router.url),
      ),
      { initialValue: this.router.url },
    );
  }

  setActiveTab(value: string): void {
    this.userService.setActiveUserTab(value);
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

  toggleCustomFeed(): void {
    this.userSettingsService.updateUserSettings({
      customFeedExpanded: !this.currentSettings()?.customFeedExpanded,
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

  toggleHome() {
    if (this.currentPath() === '/') {
      this.viewPortScroller.scrollToPosition([0, 0]);

      this.postService
        .loadInitialPosts()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          error: (error) => {
            handleHttpError(error, this.messageService);
          },
        });
    } else {
      this.router.navigate(['/']);
    }
  }

  get isCommunitiesExpanded(): boolean | undefined {
    return this.currentSettings()?.communityExpanded;
  }

  get isResourcesExpanded(): boolean | undefined {
    return this.currentSettings()?.resourcesExpanded;
  }

  get isCustomFeedExpanded(): boolean | undefined {
    return this.currentSettings()?.customFeedExpanded;
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
