import { Component } from '@angular/core';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownMenuLabelComponent } from '@shared/components/dropdown/dropdown-label.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { BlogList } from '@shared/components/blog-list/blog-list';

@Component({
  selector: 'app-home',
  imports: [
    ZardDropdownDirective,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuLabelComponent,
    ZardDropdownMenuItemComponent,
    BlogList,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  onSort() {
    console.log('Sort Clicked!');
  }
}
