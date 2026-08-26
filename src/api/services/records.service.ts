import api from "../client";
import { MyRecord, Section } from "../../types";

export const recordsService = {
  getRecords: (section: Section) =>
    api.get<MyRecord[]>(`/records?section=${section}`),

  getUpdates: (since?: string) =>
    api.get<MyRecord[]>(`/records/updates${since ? `?since=${since}` : ""}`),

  createRecord: (
    data: Omit<MyRecord, "id" | "createdAt" | "updatedAt" | "userId">,
  ) => api.post<MyRecord>("/records", data),

  updateRecord: (id: string, data: Partial<Omit<MyRecord, "id" | "userId">>) =>
    api.patch<MyRecord>(`/records/${id}`, data),

  deleteRecord: (id: string) => api.delete<void>(`/records/${id}`),
};
