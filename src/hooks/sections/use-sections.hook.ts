import type { Section, CreateSectionDto, UpdateSectionDto } from "../../types";
import { useQuery } from "@tanstack/react-query";

import { sectionsService } from "../../api";
import { useCreate, useUpdate, useDelete } from "../api";

export const useSections = () => {
  return useQuery<Section[]>({
    queryKey: ["sections"],
    queryFn: () => sectionsService.getSections().then((res) => res.data),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateSection = () => {
  return useCreate<Section, CreateSectionDto>(
    (data) => sectionsService.createSection(data).then((res) => res.data),
    ["sections"],
  );
};

export const useUpdateSection = () => {
  return useUpdate<Section, { id: string; data: UpdateSectionDto }>(
    ({ id, data }) =>
      sectionsService.updateSection(id, data).then((res) => res.data),
    ["sections"],
  );
};

export const useDeleteSection = () => {
  return useDelete<void>(
    (id) => sectionsService.deleteSection(id).then((res) => res.data),
    ["sections"],
  );
};
