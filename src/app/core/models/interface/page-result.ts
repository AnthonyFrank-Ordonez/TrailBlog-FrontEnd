export interface ExploreMetadata {
  allCommunitiesJoined: boolean;
  code: string;
  message: string;
}

export type PostMetadata = ExploreMetadata | Record<string, unknown>;
export interface PageResult<T, M = PostMetadata> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  metadata?: M;
}
