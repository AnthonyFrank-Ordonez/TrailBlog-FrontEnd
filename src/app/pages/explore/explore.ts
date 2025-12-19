import { Component, inject } from '@angular/core';
import { PostService } from '@core/services/post.service';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuLabelComponent } from '@shared/components/dropdown/dropdown-label.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { PostList } from '@shared/components/post-list/post-list';

@Component({
  selector: 'app-explore',
  imports: [
    PostList,
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuLabelComponent,
    ZardDropdownMenuItemComponent,
  ],
  templateUrl: './explore.html',
  styleUrl: './explore.css',
})
export class Explore {
  private postService = inject(PostService);

  explorePosts = this.postService.posts;
  exploreMetaData = this.postService.metadata;
}
