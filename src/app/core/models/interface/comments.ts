export type CommentAction = 'initial-delete' | 'delete' | 'remove' | 'report';

export interface Comment {
  id: string;
  content: string;
  username: string;
  commentedAt: Date;
  lastUpdatedAt: Date;
  isDeleted: boolean;
  isOwner: boolean;
  userId: string | null;
  postId: string | null;
}

export interface CommentDropdownItems {
  label: string;
  iconClass: string;
  svgPath: Array<string>;
  ownerOnly: boolean;
  forAuthenticated: boolean;
  hideForOwner?: boolean;
  action: CommentAction;
  fill: boolean;
}

export interface AddCommentRequest {
  postId: string;
  content: string;
}

export interface CommentActionClickEvent {
  action: CommentAction;
  event: MouseEvent;
}
