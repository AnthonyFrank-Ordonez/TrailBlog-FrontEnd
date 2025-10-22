import { Comment } from './comments';
import { ReactionSummary } from './reactions';

export type ReactionType = 'like' | 'dislike';

export interface Post {
  id: string;
  title: string;
  content: string;
  author: string;
  slug: string;
  createdAt: Date;
  username: string;
  communityName: string;
  communityId: string;
  totalComment: number;
  comments?: Comment[] | null;
  reactions: ReactionSummary[];
  userReactionsIds: number[];
  totalReactions: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  communityId: string;
}
