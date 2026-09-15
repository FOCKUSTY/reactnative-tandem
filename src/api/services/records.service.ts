import type {
  MyRecord,
  CreateRecordDto,
  UpdateRecordDto,
  GetRecordsParams,
} from "../../types";

import api from "../client";

export const recordsService = {
  getRecords: (params?: GetRecordsParams) => {
    const queryParams = new URLSearchParams();
    if (params?.sectionIds?.length)
      queryParams.append("sectionIds", params.sectionIds.join(","));
    if (params?.tags?.length) queryParams.append("tags", params.tags.join(","));
    if (params?.isCompleted !== undefined)
      queryParams.append("isCompleted", String(params.isCompleted));
    if (params?.isPinned !== undefined)
      queryParams.append("isPinned", String(params.isPinned));
    if (params?.dateFrom) queryParams.append("dateFrom", params.dateFrom);
    if (params?.dateTo) queryParams.append("dateTo", params.dateTo);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.limit) queryParams.append("limit", String(params.limit));
    if (params?.offset) queryParams.append("offset", String(params.offset));
    if (params?.isReport !== undefined)
      queryParams.append("isReport", String(params.isReport));

    const url = `/records${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    return api.get<MyRecord[]>(url);
  },

  getRecordById: (id: string) => api.get<MyRecord>(`/records/${id}`),

  getRecordsBySlug: (slug: string) =>
    api.get<MyRecord[]>(`/records?section=${slug}`),

  getUpdates: (since?: string) =>
    api.get<MyRecord[]>(`/records/updates${since ? `?since=${since}` : ""}`),

  createRecord: (data: CreateRecordDto) => api.post<MyRecord>("/records", data),

  updateRecord: (id: string, data: UpdateRecordDto) =>
    api.patch<MyRecord>(`/records/${id}`, data),

  deleteRecord: (id: string) => api.delete<void>(`/records/${id}`),
};
