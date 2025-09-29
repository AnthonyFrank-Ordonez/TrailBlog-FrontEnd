import { DatePipe } from '@angular/common';
import { Component, inject, input, signal } from '@angular/core';
import { ZardDropdownMenuItemComponent } from '@shared/components/dropdown/dropdown-item.component';
import { ZardDropdownMenuContentComponent } from '@shared/components/dropdown/dropdown-menu-content.component';
import { ZardDropdownDirective } from '@shared/components/dropdown/dropdown-trigger.directive';
import { Post } from 'src/app/core/models/interface/posts';
import { PostService } from 'src/app/core/services/post.service';

@Component({
  selector: 'app-post-card',
  imports: [
    DatePipe,
    ZardDropdownMenuContentComponent,
    ZardDropdownMenuItemComponent,
    ZardDropdownDirective,
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.css',
})
export class PostCard {
  post = input.required<Post>();
}
