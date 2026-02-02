import { Component, inject, signal } from '@angular/core';
import { DropdownService } from '@core/services/dropdown.service';
import { PostService } from '@core/services/post.service';
import { PostList } from '@shared/components/post-list/post-list';
import { Tooltip } from '@shared/components/tooltip/tooltip';

@Component({
  selector: 'app-explore',
  imports: [PostList, Tooltip],
  templateUrl: './explore.html',
  styleUrl: './explore.css',
})
export class Explore {
  private postService = inject(PostService);
  private dropdownService = inject(DropdownService);

  activePostFilter = signal<string>('Best');
  postFilterType = signal<string[]>(['Best', 'New', 'Top']);

  explorePosts = this.postService.posts;
  exploreMetaData = this.postService.metadata;
  isExplorePostLoading = this.postService.isPostLoading;

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
