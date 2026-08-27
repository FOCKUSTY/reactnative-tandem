import type { MyRecord, CreateRecordDto, UpdateRecordDto } from "../types";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordsService } from "../api";
import { RecordFilters } from "../contexts";

export const useRecords = (filters?: RecordFilters) => {
  return useQuery<MyRecord[]>({
    queryKey: ["records", filters],
    queryFn: () => recordsService.getRecords(filters).then((res) => res.data),
    enabled: true,
  });
};

export const useRecordsBySlug = (slug: string) => {
  return useQuery<MyRecord[]>({
    queryKey: ["records", slug],
    queryFn: () =>
      recordsService.getRecordsBySlug(slug).then((res) => res.data),
    enabled: !!slug,
  });
};

export const useCreateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MyRecord, Error, CreateRecordDto>({
    mutationFn: (data) =>
      recordsService.createRecord(data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      if (variables.sectionId) {
        queryClient.invalidateQueries({
          queryKey: ["records", variables.sectionId],
        });
      }
    },
  });
};

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MyRecord, Error, { id: string; data: UpdateRecordDto }>({
    mutationFn: ({ id, data }) =>
      recordsService.updateRecord(id, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
      if (variables.data.sectionId) {
        queryClient.invalidateQueries({
          queryKey: ["records", variables.data.sectionId],
        });
      }
    },
  });
};

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => recordsService.deleteRecord(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
  });
};
