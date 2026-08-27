import type { MyRecord, CreateRecordDto, UpdateRecordDto } from "../../types";
import { useQuery } from "@tanstack/react-query";

import { recordsService } from "../../api";
import { RecordFilters } from "../../contexts";
import { useCreate, useUpdate, useDelete } from "../api";

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
  return useCreate<MyRecord, CreateRecordDto>(
    (data) => recordsService.createRecord(data).then((res) => res.data),
    ["records"],
  );
};

export const useUpdateRecord = () => {
  return useUpdate<MyRecord, { id: string; data: UpdateRecordDto }>(
    ({ id, data }) =>
      recordsService.updateRecord(id, data).then((res) => res.data),
    ["records"],
  );
};

export const useDeleteRecord = () => {
  return useDelete<void>(
    (id) => recordsService.deleteRecord(id).then((res) => res.data),
    ["records"],
  );
};
