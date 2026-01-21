export type CommentLoadingStrategy = 'profile';

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
  postSlug: string | null;
}

export interface AddCommentRequest {
  postId: string;
  content: string;
}
export interface CommentStrategyConfig {
  endpoint: string;
  useSessionId: boolean;
}
