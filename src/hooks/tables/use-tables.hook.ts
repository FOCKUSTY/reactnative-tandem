import type {
  TableSection,
  Table,
  UpdateCellDto,
  CreateRowDto,
  CreateOrUpdateCellDto,
} from "../../types/table.types";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tablesService } from "../../api/services/tables.service";
import { useCreate, useUpdate, useDelete } from "../api/use-crud.hook";

export const useTableSections = () => {
  return useQuery<TableSection[]>({
    queryKey: ["table-sections"],
    queryFn: () => tablesService.getTableSections().then((res) => res.data),
    staleTime: 1000 * 60 * 10,
  });
};

export const useCreateTableSection = () => {
  return useCreate<
    TableSection,
    { name: string; slug?: string; order?: number }
  >(
    (data) => tablesService.createTableSection(data).then((res) => res.data),
    ["table-sections"],
  );
};

export const useUpdateTableSection = () => {
  return useUpdate<
    TableSection,
    { id: string; data: { name?: string; order?: number } }
  >(
    ({ id, data }) =>
      tablesService.updateTableSection(id, data).then((res) => res.data),
    ["table-sections"],
  );
};

export const useDeleteTableSection = () => {
  return useDelete<void>(
    (id) => tablesService.deleteTableSection(id).then((res) => res.data),
    ["table-sections"],
  );
};

export const useReorderTableSections = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) =>
      tablesService.reorderTableSections({ ids }).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table-sections"] });
    },
  });
};

export const useTables = () => {
  return useQuery<Table[]>({
    queryKey: ["tables"],
    queryFn: () => tablesService.getTables().then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });
};

export const useTable = (id: string) => {
  return useQuery<Table>({
    queryKey: ["table", id],
    queryFn: () => tablesService.getTable(id).then((res) => res.data),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateTable = () => {
  return useCreate<Table, Parameters<typeof tablesService.createTable>[0]>(
    (data) => tablesService.createTable(data).then((res) => res.data),
    ["tables"],
  );
};

export const useUpdateTable = () => {
  return useUpdate<
    Table,
    { id: string; data: Parameters<typeof tablesService.updateTable>[1] }
  >(
    ({ id, data }) =>
      tablesService.updateTable(id, data).then((res) => res.data),
    ["tables"],
  );
};

export const useDeleteTable = () => {
  return useDelete<void>(
    (id) => tablesService.deleteTable(id).then((res) => res.data),
    ["tables"],
  );
};

export const useReorderTables = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { sectionId: string; ids: string[] }) =>
      tablesService.reorderTables(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useCreateField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      tableId,
      data,
    }: {
      tableId: string;
      data: Parameters<typeof tablesService.createField>[1];
    }) => tablesService.createField(tableId, data).then((res) => res.data),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ["table", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useUpdateField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof tablesService.updateField>[1];
    }) => tablesService.updateField(id, data).then((res) => res.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["table"] });
    },
  });
};

export const useDeleteField = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      tablesService.deleteField(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["table"] });
    },
  });
};

export const useReorderFields = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tableId: string; ids: string[] }) =>
      tablesService.reorderFields(data).then((res) => res.data),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ["table", tableId] });
    },
  });
};

export const useCreateRow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, data }: { tableId: string; data?: CreateRowDto }) =>
      tablesService.createRow(tableId, data).then((res) => res.data),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ["table", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};

export const useDeleteRow = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      tablesService.deleteRow(id).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["table"] });
    },
  });
};

export const useReorderRows = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { tableId: string; ids: string[] }) =>
      tablesService.reorderRows(data).then((res) => res.data),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ["table", tableId] });
    },
  });
};

export const useUpdateCell = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCellDto }) =>
      tablesService.updateCell(id, data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table"] });
    },
  });
};

/**
 * Upsert значения и типа ячейки. Тип — необязательный:
 *  - не передаём `cellType` → не трогаем override;
 *  - `cellType: null` → снимаем override;
 *  - `cellType: <тип>` → устанавливаем тип.
 */
export const useCreateOrUpdateCell = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateOrUpdateCellDto) =>
      tablesService.createOrUpdateCell(data).then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["table"] });
    },
  });
};

export const useDuplicateTable = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Table,
    Error,
    { id: string; name?: string; sectionId?: string }
  >({
    mutationFn: ({ id, name, sectionId }) =>
      tablesService
        .duplicateTable(id, { name, sectionId })
        .then((res) => res.data),
    onSuccess: (_, { sectionId }) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["table-sections"] });
      if (sectionId) {
        queryClient.invalidateQueries({ queryKey: ["table-sections"] });
      }
    },
  });
};
