export interface ExploreMetadata {
  allCommunitiesJoined: boolean;
  code: string;
  message: string;
}

export type MetaData = ExploreMetadata | Record<string, unknown>;

export interface PageResult<T, M = MetaData> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
  metadata?: M;
}
