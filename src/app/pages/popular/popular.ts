import { Component, inject } from '@angular/core';
import { PostService } from '@core/services/post.service';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuLabelComponent } from '@shared/components/dropdown/dropdown-label.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { PostList } from '@shared/components/post-list/post-list';

@Component({
  selector: 'app-popular',
  imports: [
    PostList,
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuLabelComponent,
    ZardDropdownMenuItemComponent,
  ],
  templateUrl: './popular.html',
  styleUrl: './popular.css',
})
export class Popular {
  private postService = inject(PostService);

  popularPosts = this.postService.posts;
}
