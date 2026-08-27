import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sectionsService } from "../api/services/sections.service";
import { Section, CreateSectionDto, UpdateSectionDto } from "../types";

export const useSections = () => {
  return useQuery<Section[]>({
    queryKey: ["sections"],
    queryFn: () => sectionsService.getSections().then((res) => res.data),
  });
};

export const useCreateSection = () => {
  const queryClient = useQueryClient();
  return useMutation<Section, Error, CreateSectionDto>({
    mutationFn: (data) =>
      sectionsService.createSection(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
};

export const useUpdateSection = () => {
  const queryClient = useQueryClient();
  return useMutation<Section, Error, { id: string; data: UpdateSectionDto }>({
    mutationFn: ({ id, data }) =>
      sectionsService.updateSection(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
};

export const useDeleteSection = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      sectionsService.deleteSection(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
  });
};
