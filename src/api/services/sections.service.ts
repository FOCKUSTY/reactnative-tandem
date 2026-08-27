import type { Section, CreateSectionDto, UpdateSectionDto } from "../../types";
import api from "../client";

export const sectionsService = {
  getSections: () => api.get<Section[]>("/sections"),
  createSection: (data: CreateSectionDto) =>
    api.post<Section>("/sections", data),
  updateSection: (id: string, data: UpdateSectionDto) =>
    api.patch<Section>(`/sections/${id}`, data),
  deleteSection: (id: string) => api.delete<void>(`/sections/${id}`),
};
