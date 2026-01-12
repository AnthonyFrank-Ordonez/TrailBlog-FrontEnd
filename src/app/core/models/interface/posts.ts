import { Comment } from './comments';
import { PostAction } from './menus';
import { ReactionSummary } from './reactions';

export type ReactionType = 'like' | 'dislike';

export type PostLoadingStrategy =
  | 'regular'
  | 'popular'
  | 'explore'
  | 'drafts'
  | 'archives'
  | 'profile-posts'
  | 'profile-saved'
  | 'profile-view-history';

export type PostDeleteType = 'home' | 'saved' | 'drafts' | 'detail';

export type DropdownType = 'menu' | 'share' | 'reaction' | 'filter' | 'create';
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
  isOwner: boolean;
  isSaved: boolean;
  totalComment: number;
  comments?: Comment[] | null;
  reactions: ReactionSummary[];
  userReactionsIds: number[];
  totalReactions: number;
}

export interface RecentViewedPost {
  postId: string;
  title: string;
  content: string;
  author: string;
  slug: string;
  createdAt: Date;
  communityName: string;
  totalComment: number;
  totalReactions: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  communityId: string;
}

export interface PostStrategyConfig {
  endpoint: string;
  useSessionId: boolean;
}

export interface PostDeleteConfig {
  endpoint: string;
}

export interface PostDropdown {
  type: DropdownType | null;
  id: string | null;
}

export interface PostActionPayload {
  action: PostAction;
  post: Post;
}
