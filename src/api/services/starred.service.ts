import type { MyRecord } from "../../types";
import api from "../client";

export const starredService = {
  getStarred: () => api.get<MyRecord[]>("/records/starred"),

  addStarred: (recordId: string) => api.post("/records/starred", { recordId }),

  removeStarred: (recordId: string) =>
    api.delete(`/records/starred/${recordId}`),
};
