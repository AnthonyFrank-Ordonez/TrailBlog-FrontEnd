import { DatePipe, NgClass } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { Post } from 'src/app/core/models/interface/posts';
import { CommunityService } from 'src/app/core/services/community.service';

@Component({
  selector: 'app-post-card',
  imports: [
    DatePipe,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownDirective,
    NgClass,
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  private communityService = inject(CommunityService);

  userCommunities = this.communityService.userCommunities;
  post = input.required<Post>();

  get isJoined(): boolean {
    return this.userCommunities().some((uc) => uc.id === this.post().communityId);
  }
}
