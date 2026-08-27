import api from "../client";
import { Section, CreateSectionDto, UpdateSectionDto } from "../../types";

export const sectionsService = {
  getSections: () => api.get<Section[]>("/sections"),
  createSection: (data: CreateSectionDto) =>
    api.post<Section>("/sections", data),
  updateSection: (id: string, data: UpdateSectionDto) =>
    api.patch<Section>(`/sections/${id}`, data),
  deleteSection: (id: string) => api.delete<void>(`/sections/${id}`),
};
