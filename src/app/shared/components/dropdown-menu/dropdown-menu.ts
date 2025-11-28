import { NgClass } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import {
  CommentAction,
  CommentActionClickEvent,
  CommentDropdownItems,
} from '@core/models/interface/comments';
import { ActionClickEvent, PostAction, PostDropdownItems } from '@core/models/interface/posts';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-dropdown-menu',
  imports: [NgClass],
  templateUrl: './dropdown-menu.html',
  styleUrl: './dropdown-menu.css',
})
export class DropdownMenu {
  private authService = inject(AuthService);

  dropdownItems = input.required<PostDropdownItems[] | CommentDropdownItems[]>();
  isOwner = input<boolean>(false);
  styles = input<string>();
  dropdownWidth = input<string>('w-32');
  modalType = input<string>('');
  itemClicked = output<ActionClickEvent>();
  commentItemClicked = output<CommentActionClickEvent>();
  isAuthenticated = this.authService.isAuthenticated;

  private readonly COMMENT_ACTIONS = new Set<CommentAction>(['initial-delete', 'remove', 'report']);

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

  onItemClick(item: PostDropdownItems | CommentDropdownItems, event: MouseEvent) {
    event?.stopPropagation();

    if (this.isCommentDropdownItem(item)) {
      this.handleCommentItemClick(item, event);
    } else {
      this.handleItemClick(item, event);
    }
  }

  handleItemClick(item: PostDropdownItems, event: MouseEvent) {
    event?.stopPropagation();
    this.itemClicked.emit({
      action: item.action,
      event: event,
    });
  }

  handleCommentItemClick(item: CommentDropdownItems, event: MouseEvent) {
    event?.stopPropagation();
    this.commentItemClicked.emit({
      action: item.action,
      event: event,
    });
  }

  private isCommentDropdownItem(
    item: PostDropdownItems | CommentDropdownItems,
  ): item is CommentDropdownItems {
    return this.COMMENT_ACTIONS.has(item.action as CommentAction);
  }
}
