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
  /**
   * Опциональный тип, переопределяющий тип поля для этой конкретной ячейки.
   * `null`/`undefined` — использовать тип поля как есть.
   */
  cellType?: FieldType | null;
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

/**
 * Тело запроса на создание строки.
 *
 * `position` — куда вставить (1-based, отрицательные считаются с конца):
 *   1   — в начало
 *   2   — второй позицией
 *   -1  — в конец (последней)
 *   -2  — предпоследней
 * Если `position` не задан, строка добавляется в конец. `order` оставлен
 * для обратной совместимости: если задан явно — используется как 0-based
 * индекс вставки (старое поведение).
 */
export type CreateRowDto = {
  order?: number;
  position?: number;
};

export type UpdateCellDto = {
  value: string;
  cellType?: FieldType | null;
};

export type CreateOrUpdateCellDto = {
  rowId: string;
  fieldId: string;
  value: string;
  /**
   * `undefined` — не трогать текущий override;
   * `null` — снять override;
   * `FieldType` — установить конкретный тип.
   */
  cellType?: FieldType | null;
};

export type ReorderDto = {
  ids: string[];
};

export type ReorderTablesDto = ReorderDto & { sectionId: string };
export type ReorderFieldsDto = ReorderDto & { tableId: string };
export type ReorderRowsDto = ReorderDto & { tableId: string };

export type TableRowData = Omit<Row, "cells"> & {
  cells: Record<string, string>;
  /**
   * Карта переопределённых типов: fieldId → FieldType. Если ключа нет,
   * используется `field.type`. Пустая карта = как раньше.
   */
  cellTypes?: Record<string, FieldType>;
};

export type TableWithRecordRows = Omit<Table, "rows"> & {
  rows: TableRowData[];
};
