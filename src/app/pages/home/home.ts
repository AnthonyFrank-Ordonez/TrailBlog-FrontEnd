import { Component, inject } from '@angular/core';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownMenuLabelComponent } from '@shared/components/dropdown/dropdown-label.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { PostList } from '@shared/components/post-list/post-list';
import { PostService } from '@core/services/post.service';

@Component({
  selector: 'app-home',
  imports: [
    PostList,
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuLabelComponent,
    ZardDropdownMenuItemComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private postService = inject(PostService);

  regularPosts = this.postService.regularPosts;

  onSort() {
    console.log('Sort Clicked!');
  }
}
