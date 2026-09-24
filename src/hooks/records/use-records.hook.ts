import type { MyRecord, CreateRecordDto, UpdateRecordDto } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { recordsService } from "../../api";
import { RecordFilters } from "../../contexts";
import { notificationService } from "../../services/notification.service";

export const useRecords = (filters?: RecordFilters) => {
  const queryKey = filters ? ["records", filters] : ["records"];
  return useQuery<MyRecord[]>({
    queryKey,
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
    staleTime: 1000 * 60 * 2,
  });
};

const invalidateRecordDependents = (
  queryClient: ReturnType<typeof useQueryClient>,
  id?: string,
) => {
  queryClient.invalidateQueries({ queryKey: ["records"] });
  queryClient.invalidateQueries({ queryKey: ["sections"] });
  queryClient.invalidateQueries({ queryKey: ["reminders"] });
  if (id) queryClient.invalidateQueries({ queryKey: ["record", id] });
};

export const useCreateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MyRecord, Error, CreateRecordDto>({
    mutationFn: (data) =>
      recordsService.createRecord(data).then((res) => res.data),
    onSuccess: () => {
      invalidateRecordDependents(queryClient);
    },
  });
};

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MyRecord, Error, { id: string; data: UpdateRecordDto }>({
    mutationFn: ({ id, data }) =>
      recordsService.updateRecord(id, data).then((res) => res.data),
    onSuccess: (_, { id }) => {
      invalidateRecordDependents(queryClient, id);
    },
  });
};

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      recordsService.deleteRecord(id).then((res) => res.data),
    onSuccess: (_, id) => {
      notificationService.cancelForRecord(id);
      invalidateRecordDependents(queryClient, id);
      queryClient.removeQueries({ queryKey: ["record", id] });
    },
  });
};
