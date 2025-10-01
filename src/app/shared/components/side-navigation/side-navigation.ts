import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
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

  activeTab = signal<string>('home');
  currentSettings = this.userSettingsService.userSettings;
  isAuthenticated = this.authService.isAuthenticated;

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
}
