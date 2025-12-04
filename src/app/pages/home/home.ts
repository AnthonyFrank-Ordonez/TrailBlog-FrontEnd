import { Component, HostListener, inject, signal } from '@angular/core';
import { PostList } from '@shared/components/post-list/post-list';
import { PostService } from '@core/services/post.service';
import { Tooltip } from '@shared/components/tooltip/tooltip';

@Component({
  selector: 'app-home',
  imports: [PostList, Tooltip],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private postService = inject(PostService);

  activePostFilter = signal<string>('Best');
  postFilterType = signal<string[]>(['Best', 'New', 'Top']);
  regularPosts = this.postService.posts;

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

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const modal = this.postService.activeDropdown();

    if (modal.type === null) return;

    const target = event.target as HTMLElement;

    const insideModal = target.closest('[data-modal-type]');
    const isButton = target.closest('.action-btn, button');

    if (!insideModal && !isButton) {
      this.postService.closeDropdown();
    }
  }
}
