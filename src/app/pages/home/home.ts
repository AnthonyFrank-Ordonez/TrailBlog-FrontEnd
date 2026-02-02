import { Component, HostListener, inject, signal } from '@angular/core';
import { PostList } from '@shared/components/post-list/post-list';
import { PostService } from '@core/services/post.service';
import { Tooltip } from '@shared/components/tooltip/tooltip';
import { DropdownService } from '@core/services/dropdown.service';

@Component({
  selector: 'app-home',
  imports: [PostList, Tooltip],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  private postService = inject(PostService);
  private dropdownService = inject(DropdownService);

  activePostFilter = signal<string>('Best');
  postFilterType = signal<string[]>(['Best', 'New', 'Top']);
  regularPosts = this.postService.posts;
  isPostLoading = this.postService.isPostLoading;

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

  @HostListener('document:click', ['$event'])
  handleOutsideClick(event: MouseEvent) {
    const modal = this.dropdownService.activeDropdown();

    if (modal.type === null) return;

    const target = event.target as HTMLElement;

    const insideModal = target.closest('[data-modal-type]');
    const isButton = target.closest('.action-btn, button');

    if (!insideModal && !isButton) {
      this.dropdownService.closeDropdown();
    }
  }
}
