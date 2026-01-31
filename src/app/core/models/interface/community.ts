export type CommunityFilterType = 'All' | 'Favorite';

export interface Communities {
  id: string;
  communityName: string;
  description?: string;
  communitySlug: string;
  owner: string;
  isFavorite: boolean;
  isUserJoined: boolean;
}

export interface CreateCommunityRequest {
  name: string;
  description: string;
}
