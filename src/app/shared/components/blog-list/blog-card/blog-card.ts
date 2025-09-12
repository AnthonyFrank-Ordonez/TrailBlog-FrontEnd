import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Blog } from 'src/app/core/models/interface/blogs';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';

@Component({
  selector: 'app-blog-card',
  imports: [
    DatePipe,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownDirective,
  ],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.css',
})
export class BlogCard {
  blog = input.required<Blog>();
}
