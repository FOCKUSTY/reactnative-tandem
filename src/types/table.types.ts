export interface TableSection {
  id: string;
  pairId: string;
  name: string;
  slug: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  tables: Table[];
}

export interface Table {
  id: string;
  sectionId: string;
  section?: TableSection;
  name: string;
  description?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  fields: Field[];
  rows: Row[];
  _count?: {
    fields: number;
    rows: number;
  };
}

export type FieldType =
  "text" | "number" | "date" | "boolean" | "select" | "multiline";

export interface Field {
  id: string;
  tableId: string;
  table?: Table;
  name: string;
  type: FieldType;
  required: boolean;
  options: string[];
  defaultValue?: string | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Row {
  id: string;
  tableId: string;
  table?: Table;
  order: number;
  createdAt: string;
  updatedAt: string;
  cells: Cell[];
}

export interface Cell {
  id: string;
  rowId: string;
  row?: Row;
  fieldId: string;
  field?: Field;
  value: string;
  createdAt: string;
  updatedAt: string;
}

export type CreateTableDto = {
  sectionId: string;
  name: string;
  description?: string;
  order?: number;
};

export type UpdateTableDto = Partial<{
  name: string;
  description: string;
  order: number;
  sectionId: string;
}>;

export type CreateFieldDto = {
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  defaultValue?: string | null;
  order?: number;
};

export type UpdateFieldDto = Partial<{
  name: string;
  type: FieldType;
  required: boolean;
  options: string[];
  defaultValue: string | null;
  order: number;
}>;

export type CreateRowDto = {
  order?: number;
};

export type UpdateCellDto = {
  value: string;
};

export type ReorderDto = {
  ids: string[];
};

export type ReorderTablesDto = ReorderDto & { sectionId: string };
export type ReorderFieldsDto = ReorderDto & { tableId: string };
export type ReorderRowsDto = ReorderDto & { tableId: string };

export type TableRowData = Omit<Row, "cells"> & {
  cells: Record<string, string>;
};

export type TableWithRecordRows = Omit<Table, "rows"> & {
  rows: TableRowData[];
};
