export interface PostSearchResult {
  id: string;
  title: string;
  author: string;
  type: string;
}

export interface CommunitySearchResult {
  id: string;
  communityName: string;
  description?: string;
  type: string;
}

export interface UnifiedSearchResults {
  posts: PostSearchResult[];
  communities: CommunitySearchResult[];
}
