import { Post } from './posts';

export interface Communities {
  id: string;
  communityName: string;
  description?: string;
  owner: string;
}

export interface CreateCommunityRequest {
  name: string;
  description: string;
}
