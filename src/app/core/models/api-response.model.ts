export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: string | null;
  correlationId: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  unreadCount: number | null;
}
