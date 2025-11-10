import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { CommunityFilterType } from '@core/models/interface/community';
import { CommunityService } from '@core/services/community.service';

@Component({
  selector: 'app-manage-communities-bar',
  imports: [NgClass],
  templateUrl: './manage-communities-bar.html',
  styleUrl: './manage-communities-bar.css',
})
export class ManageCommunitiesBar {
  private communityService = inject(CommunityService);

  activeButton = this.communityService.activeCommunityFilterBtn;

  handleButtonFilter(filter: CommunityFilterType) {
    this.communityService.setCommunityFilter(filter);
    this.communityService.setActiveCommunityFilter(filter);
  }
}
