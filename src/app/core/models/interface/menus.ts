export type PostAction =
  | 'share'
  | 'copy'
  | 'embed'
  | 'save'
  | 'unsave'
  | 'hide'
  | 'report'
  | 'delete'
  | 'archive'
  | 'profile';

export type CommentAction = 'initial-delete' | 'delete' | 'remove' | 'report';

interface BaseMenuItems {
  label: string;
  iconClass: string;
  svgPath: string[];
  fill?: boolean;
}

export interface PostMenuItems extends BaseMenuItems {
  type: 'post';
  hideForOwner?: boolean;
  ownerOnly: boolean;
  forAuthenticated: boolean;
  action: PostAction;
}

export interface CommentMenuItems extends BaseMenuItems {
  type: 'comment';
  hideForOwner?: boolean;
  ownerOnly: boolean;
  forAuthenticated: boolean;
  action: CommentAction;
}

export type MenuItems = PostMenuItems | CommentMenuItems;

export interface PostActionClickEvent {
  type: 'post';
  action: PostAction;
  event: MouseEvent;
}

export interface CommentActionClickEvent {
  type: 'comment';
  action: CommentAction;
  event: MouseEvent;
}

export type MenuClickEvent = PostActionClickEvent | CommentActionClickEvent;
