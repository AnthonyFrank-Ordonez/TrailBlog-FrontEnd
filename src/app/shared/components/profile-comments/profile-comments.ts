import { Component, inject } from '@angular/core';
import { CommentService } from '@core/services/comment.service';
import { CommentList } from '../comment-list/comment-list';

@Component({
  selector: 'app-profile-comments',
  imports: [CommentList],
  templateUrl: './profile-comments.html',
  styleUrl: './profile-comments.css',
})
export class ProfileComments {
  private commentService = inject(CommentService);

  userComments = this.commentService.comments;
}
