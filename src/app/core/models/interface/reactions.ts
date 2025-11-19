import { Post } from './posts';

export interface ReactionRequest {
  post: Post;
  data: ReactionData;
}

export interface ReactionData {
  reactionId: number;
}

export interface ReactionList {
  id: number;
  type: string;
  value: string;
}

export interface ReactionSummary {
  reactionId: number;
  count: number;
}
