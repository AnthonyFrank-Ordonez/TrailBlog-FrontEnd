import { Component, input, output } from '@angular/core';
import { Comment } from '@core/models/interface/comments';
import { InitialsPipe } from '@shared/pipes/initials-pipe';
import { TimeagoPipe } from '@shared/pipes/timeago-pipe';

@Component({
  selector: 'app-comment-card',
  imports: [TimeagoPipe, InitialsPipe],
  templateUrl: './comment-card.html',
  styleUrl: './comment-card.css',
})
export class CommentCard {
  comment = input.required<Comment>();

  commentDetailAction = output<Comment>();

  handleCommentNavigate(event: MouseEvent) {
    event.stopPropagation();
    this.commentDetailAction.emit(this.comment());
  }
}
