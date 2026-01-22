import { Component, inject, signal } from '@angular/core';
import { DropdownService } from '@core/services/dropdown.service';
import { PostService } from '@core/services/post.service';
import { PostList } from '@shared/components/post-list/post-list';
import { Tooltip } from '@shared/components/tooltip/tooltip';

@Component({
  selector: 'app-popular',
  imports: [PostList, Tooltip],
  templateUrl: './popular.html',
  styleUrl: './popular.css',
})
export class Popular {
  private postService = inject(PostService);
  private dropdownService = inject(DropdownService);

  activePostFilter = signal<string>('Best');
  postFilterType = signal<string[]>(['Best', 'New', 'Top']);
  popularPosts = this.postService.posts;

  togglePostMenuFilter() {
    this.dropdownService.toggleDropdown('filter', 'filter');
  }

  togglePostFilter(filter: string) {
    // TODO: implement togglePostFilter
    this.dropdownService.closeDropdown();
    console.log('🚀 ~ Home ~ togglePostFilter ~ filter:', filter);
  }

  isPostMenuFilterOpen(): boolean {
    return this.dropdownService.isDropDownOpen('filter', 'filter');
  }
}
