import { NgClass } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { Post, PostDropdownItems } from '@core/models/interface/posts';
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
  isAuthenticated = this.authService.isAuthenticated;

  get filteredMenuItems() {
    return this.dropdownItems().filter(
      (item) =>
        (!item.ownerOnly && !item.forAuthenticated) ||
        (this.isAuthenticated() && (!item.ownerOnly || this.isOwner())),
    );
  }
}
