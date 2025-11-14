import { Comment } from './comments';
import { ReactionSummary } from './reactions';

export type ReactionType = 'like' | 'dislike';

export type PostLoadingStrategy = 'regular' | 'popular';

export type DropdownType = 'menu' | 'share' | 'reaction';

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

export interface PostDropdownItems {
  label: string;
  iconClass: string;
  svgPath: Array<string>;
  ownerOnly: boolean;
  forAuthenticated: boolean;
  action: (event?: MouseEvent) => void;
}

export interface PostDropdown {
  type: DropdownType | null;
  id: string | null;
}
