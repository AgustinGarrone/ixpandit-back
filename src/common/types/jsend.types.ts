export enum JSendStatus {
  SUCCESS = 'SUCCESS',
  FAIL = 'FAIL',
  ERROR = 'ERROR',
}

export class JSendSuccess<T> {
  status?: JSendStatus.SUCCESS;
  data: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export class PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export class PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}
