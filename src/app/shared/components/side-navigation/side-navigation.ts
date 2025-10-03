import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, effect, inject, OnInit, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { handleHttpError } from '@shared/utils/utils';
import { AuthService } from 'src/app/core/services/auth.service';
import { CommunityService } from 'src/app/core/services/community.service';
import { MessageService } from 'src/app/core/services/message.service';
import { UserSettingsService } from 'src/app/core/services/user-settings.service';

@Component({
  selector: 'app-side-navigation',
  imports: [RouterLink],
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

  activeTab = signal<string>('home');
  currentSettings = this.userSettingsService.userSettings;
  isAuthenticated = this.authService.isAuthenticated;
  userCommunities = this.communityService.userCommunities;

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

  toggleCustomFeed(): void {
    this.userSettingsService.updateUserSettings({
      customFeedExpanded: !this.currentSettings()?.customFeedExpanded,
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
}
