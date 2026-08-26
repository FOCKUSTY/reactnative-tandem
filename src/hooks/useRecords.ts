import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { recordsService } from "../api/services/records.service";
import { MyRecord, Section, CreateRecordDto, UpdateRecordDto } from "../types";

export const useRecords = (section: Section) => {
  return useQuery<MyRecord[]>({
    queryKey: ["records", section],
    queryFn: () => recordsService.getRecords(section).then((res) => res.data),
    enabled: !!section,
  });
};

export const useCreateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<MyRecord, Error, CreateRecordDto>({
    mutationFn: (data) =>
      recordsService.createRecord(data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["records", variables.section],
      });
    },
  });
};

export const useUpdateRecord = () => {
  const queryClient = useQueryClient();
  return useMutation<
    MyRecord,
    Error,
    { id: string; data: UpdateRecordDto; section: Section }
  >({
    mutationFn: ({ id, data }) =>
      recordsService.updateRecord(id, data).then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["records", variables.section],
      });
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
