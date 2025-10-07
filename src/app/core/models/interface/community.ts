import { Post } from './posts';

export interface UserCommunities {
  id: string;
  communityName: string;
  description?: string;
  owner: string;
}
