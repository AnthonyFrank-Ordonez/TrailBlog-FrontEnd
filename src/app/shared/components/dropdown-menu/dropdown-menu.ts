import { NgClass } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import {
  CommentMenuItems,
  MenuClickEvent,
  MenuItems,
  PostMenuItems,
} from '@core/models/interface/menus';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-dropdown-menu',
  imports: [NgClass],
  templateUrl: './dropdown-menu.html',
  styleUrl: './dropdown-menu.css',
})
export class DropdownMenu {
  private authService = inject(AuthService);

  dropdownItems = input.required<MenuItems[]>();
  isOwner = input<boolean>(false);
  styles = input<string>();
  dropdownWidth = input<string>('w-32');
  modalType = input<string>('');
  menuItemClicked = output<MenuClickEvent>();
  isAuthenticated = this.authService.isAuthenticated;

  filteredMenuItems = computed(() => {
    return this.dropdownItems().filter((item) => {
      const isOwner = this.isOwner();
      const isAuth = this.isAuthenticated();

      if (item.hideForOwner && isOwner) {
        return false;
      }

      if (item.ownerOnly) {
        return isOwner;
      }

      if (item.forAuthenticated) {
        return isAuth;
      }

      return true;
    });
  });

  onItemClick(item: MenuItems, event: MouseEvent) {
    event?.stopPropagation();

    switch (item.type) {
      case 'post':
        this.handlePostItemClick(item, event);
        break;
      case 'comment':
        this.handleCommentItemClick(item, event);
        break;
    }
  }

  handlePostItemClick(item: PostMenuItems, event: MouseEvent) {
    event?.stopPropagation();
    this.menuItemClicked.emit({
      type: 'post',
      action: item.action,
      event: event,
    });
  }

  handleCommentItemClick(item: CommentMenuItems, event: MouseEvent) {
    event?.stopPropagation();
    this.menuItemClicked.emit({
      type: 'comment',
      action: item.action,
      event: event,
    });
  }
}
