import { Component, input } from '@angular/core';
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
}
