export interface ReactionRequest {
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
