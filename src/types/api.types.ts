export type ApiError = {
  message: string;
  status?: number;
  isTimeout?: boolean;
};

export interface GetRecordsParams {
  sectionIds?: string[];
  tags?: string[];
  isCompleted?: boolean;
  isPinned?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: "dateEvent" | "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  isReport?: boolean;
  offset?: number;
}
