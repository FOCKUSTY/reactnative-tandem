import type {
  TableSection,
  Table,
  Field,
  Row,
  Cell,
  CreateTableDto,
  UpdateTableDto,
  CreateFieldDto,
  UpdateFieldDto,
  CreateRowDto,
  UpdateCellDto,
  ReorderDto,
  ReorderTablesDto,
  ReorderFieldsDto,
  ReorderRowsDto,
} from "../../types";

import api from "../client";

export const tablesService = {
  getTableSections: () => api.get<TableSection[]>("/tables/sections"),
  createTableSection: (data: { name: string; slug?: string; order?: number }) =>
    api.post<TableSection>("/tables/sections", data),
  updateTableSection: (id: string, data: { name?: string; order?: number }) =>
    api.patch<TableSection>(`/tables/sections/${id}`, data),
  deleteTableSection: (id: string) =>
    api.delete<void>(`/tables/sections/${id}`),
  reorderTableSections: (data: ReorderDto) =>
    api.post<void>("/tables/sections/reorder", data),

  getTables: () => api.get<Table[]>("/tables"),
  getTable: (id: string) => api.get<Table>(`/tables/${id}`),
  createTable: (data: CreateTableDto) => api.post<Table>("/tables", data),
  updateTable: (id: string, data: UpdateTableDto) =>
    api.patch<Table>(`/tables/${id}`, data),
  deleteTable: (id: string) => api.delete<void>(`/tables/${id}`),
  reorderTables: (data: ReorderTablesDto) =>
    api.post<void>("/tables/reorder", data),

  createField: (tableId: string, data: CreateFieldDto) =>
    api.post<Field>(`/tables/${tableId}/fields`, data),
  updateField: (id: string, data: UpdateFieldDto) =>
    api.patch<Field>(`/tables/fields/${id}`, data),
  deleteField: (id: string) => api.delete<void>(`/tables/fields/${id}`),
  reorderFields: (data: ReorderFieldsDto) =>
    api.post<void>("/tables/fields/reorder", data),

  createRow: (tableId: string, data?: CreateRowDto) =>
    api.post<Row>(`/tables/${tableId}/rows`, data || {}),
  deleteRow: (id: string) => api.delete<void>(`/tables/rows/${id}`),
  reorderRows: (data: ReorderRowsDto) =>
    api.post<void>("/tables/rows/reorder", data),

  updateCell: (id: string, data: UpdateCellDto) =>
    api.patch<Cell>(`/tables/cells/${id}`, data),
  createOrUpdateCell: (data: {
    rowId: string;
    fieldId: string;
    value: string;
  }) => api.post<Cell>("/tables/cells", data),
  getCellsForTable: (tableId: string) =>
    api.get<Row[]>(`/tables/${tableId}/cells`),

  duplicateTable: (id: string, data?: { name?: string; sectionId?: string }) =>
    api.post<Table>(`/tables/${id}/duplicate`, data ?? {}),
};
