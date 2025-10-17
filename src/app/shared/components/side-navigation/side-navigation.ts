import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  OnInit,
  Signal,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CommunityService } from '@core/services/community.service';
import { MessageService } from '@core/services/message.service';
import { ModalService } from '@core/services/modal.service';
import { UserSettingsService } from '@core/services/user-settings.service';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { handleHttpError } from '@shared/utils/utils';

@Component({
  selector: 'app-side-navigation',
  imports: [RouterLink, InitialsPipe],
  templateUrl: './side-navigation.html',
  styleUrl: './side-navigation.css',
  animations: [],
})
export class SideNavigation {
  private userSettingsService = inject(UserSettingsService);
  private authService = inject(AuthService);
  private communityService = inject(CommunityService);
  private messageService = inject(MessageService);
  private destroyRef = inject(DestroyRef);
  private modalService = inject(ModalService);

  private readonly MAX_COMMUNITIES_DISPLAY = 5;

  activeTab = signal<string>('home');
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
      } else {
        this.resetCommunities();
      }
    });
  }

  setActiveTab(value: string): void {
    this.activeTab.set(value);
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

  private resetCommunities(): void {
    this.communityService.resetUserCommunities();
  }
}
