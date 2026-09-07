import type { MyRecord, CreateRecordDto, UpdateRecordDto } from "../../types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { recordsService } from "../../api";
import { RecordFilters } from "../../contexts";
import { useUpdate } from "../api";
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

export const useCreateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MyRecord, Error, CreateRecordDto>({
    mutationFn: (data) =>
      recordsService.createRecord(data).then((res) => res.data),
    onMutate: async (newRecord) => {
      await queryClient.cancelQueries({ queryKey: ["records"] });

      const previousRecords = queryClient.getQueryData<MyRecord[]>(["records"]);
      queryClient.setQueryData<MyRecord[]>(["records"], (old) => {
        if (!old) return [newRecord as MyRecord];
        return [...old, newRecord as MyRecord];
      });

      return { previousRecords };
    },
    onError: (_error, _newRecord, context) => {
      queryClient.setQueryData(["records"], (context as any)?.previousRecords);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["records"] });
    },
    retry: 2,
  });
};

export const useUpdateRecord = () => {
  return useUpdate<MyRecord, { id: string; data: UpdateRecordDto }>(
    ({ id, data }) =>
      recordsService.updateRecord(id, data).then((res) => res.data),
    ["records"],
  );
};

export const useDeleteRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      recordsService.deleteRecord(id).then((res) => res.data),
    onSuccess: (_, id) => {
      notificationService.cancelScheduled(`record_${id}`);
      queryClient.invalidateQueries({ queryKey: ["records"] });
      queryClient.removeQueries({ queryKey: ["record", id] });
    },
  });
};
