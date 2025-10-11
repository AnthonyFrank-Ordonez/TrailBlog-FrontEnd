import { Comment } from './comments';

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
  totalLike: number;
  totalComment: number;
  comments?: Comment[] | null;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  communityId: string;
}
