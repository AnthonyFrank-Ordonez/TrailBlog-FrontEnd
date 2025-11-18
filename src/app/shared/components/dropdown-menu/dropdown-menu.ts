import { NgClass } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
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

  dropdownItems = input.required<PostDropdownItems[]>();
  isOwner = input<boolean>(false);
  styles = input<string>();
  dropdownWidth = input<string>('w-32');
  modalType = input<string>('');
  itemClicked = output<ActionClickEvent>();
  isAuthenticated = this.authService.isAuthenticated;

  handleItemClick(item: PostDropdownItems, event: MouseEvent) {
    event?.stopPropagation();
    this.itemClicked.emit({
      action: item.action,
      event: event,
    });
  }

  get filteredMenuItems() {
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
  }
}
