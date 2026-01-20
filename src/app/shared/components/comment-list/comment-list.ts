import { Component } from '@angular/core';
import { CommentCard } from './comment-card/comment-card';

@Component({
  selector: 'app-comment-list',
  imports: [CommentCard],
  templateUrl: './comment-list.html',
  styleUrl: './comment-list.css',
})
export class CommentList {}
