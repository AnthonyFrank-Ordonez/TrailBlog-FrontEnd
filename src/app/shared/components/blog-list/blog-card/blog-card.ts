import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Blog } from 'src/app/core/models/interface/blogs';

@Component({
  selector: 'app-blog-card',
  imports: [DatePipe],
  templateUrl: './blog-card.html',
  styleUrl: './blog-card.css',
})
export class BlogCard {
  blog = input.required<Blog>();
}
