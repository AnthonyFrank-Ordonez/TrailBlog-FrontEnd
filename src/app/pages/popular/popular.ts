import { Component, inject, signal } from '@angular/core';
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

  activePostFilter = signal<string>('Best');
  postFilterType = signal<string[]>(['Best', 'New', 'Top']);
  popularPosts = this.postService.posts;

  togglePostMenuFilter() {
    this.postService.toggleDropdown('filter', 'filter');
  }

  togglePostFilter(filter: string) {
    // TODO: implement togglePostFilter
    this.postService.closeDropdown();
    console.log('🚀 ~ Home ~ togglePostFilter ~ filter:', filter);
  }

  isPostMenuFilterOpen(): boolean {
    return this.postService.isDropDownOpen('filter', 'filter');
  }
}
