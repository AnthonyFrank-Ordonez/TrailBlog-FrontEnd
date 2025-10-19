export interface PageResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
  hasPrevious: boolean;
  hasNext: boolean;
  metadata?: Object;
}
