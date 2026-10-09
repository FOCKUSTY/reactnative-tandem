import type {
  Field,
  FieldType,
  TableRowData,
  TableWithRecordRows,
} from "../../types/table.types";
import {
  isDraftEmpty,
  isTempId,
  type CellChange,
  type NewFieldDraft,
  type NewRowDraft,
  type TableDraft,
} from "./draft-store";

/**
 * Превращает абстрактный `position` из `CreateRowDto` в индекс массива.
 * `position` 1-based; отрицательные считаются с конца.
 *   1   → 0
 *   2   → 1
 *   -1  → end
 *   -2  → end - 1
 */
const positionToIndex = (position: number, length: number): number => {
  if (position > 0) return Math.min(position - 1, length);
  return Math.max(0, length + (position + 1));
};

const toVirtualField = (tableId: string, draft: NewFieldDraft): Field => ({
  id: draft.tempId,
  tableId,
  name: draft.name,
  type: draft.type,
  required: draft.required ?? false,
  options: draft.options ?? [],
  defaultValue: draft.defaultValue ?? null,
  order: Number.MAX_SAFE_INTEGER,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const toVirtualRow = (tableId: string, draft: NewRowDraft): TableRowData => ({
  id: draft.tempId,
  tableId,
  order: Number.MAX_SAFE_INTEGER,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  cells: { ...draft.cells },
  cellTypes: { ...draft.cellTypes },
});

/**
 * Вставляет элементы в массив по их позициям, обрабатывая по одному в порядке
 * добавления — так результат совпадает с тем, что сделает бэкенд, получая
 * последовательные `createRow({ position })`.
 */
function insertPositioned<T>(
  base: T[],
  items: { position: number; item: T }[],
): T[] {
  const result = [...base];
  for (const { position, item } of items) {
    const idx = positionToIndex(position, result.length);
    result.splice(idx, 0, item);
  }
  return result;
}

/**
 * Накладывает черновик на снимок таблицы.
 *
 *  - существующие строки получают правки из `cellChanges`;
 *  - новые столбцы вставляются виртуальными `Field` с tempId;
 *  - новые строки вставляются виртуальными `TableRowData` с tempId.
 *
 * Ничего не копирует, если черновик пуст.
 */
export function applyDraftToTable<T extends TableWithRecordRows>(
  table: T,
  draft: TableDraft,
): T {
  if (isDraftEmpty(draft)) return table;

  const realFields = [...table.fields].sort((a, b) => a.order - b.order);
  const fields = insertPositioned(
    realFields,
    draft.newFields.map((f) => ({
      position: -1,
      item: toVirtualField(table.id, f),
    })),
  );

  const byRow = new Map<string, CellChange[]>();
  for (const change of draft.cellChanges.values()) {
    const list = byRow.get(change.rowId) ?? [];
    list.push(change);
    byRow.set(change.rowId, list);
  }

  const realRows = [...table.rows]
    .sort((a, b) => a.order - b.order)
    .map((row) => {
      const rowChanges = byRow.get(row.id);
      if (!rowChanges || rowChanges.length === 0) return row;

      const cells = { ...row.cells };
      const cellTypes: Record<string, FieldType> = { ...(row.cellTypes ?? {}) };
      for (const change of rowChanges) {
        cells[change.fieldId] = change.value;
        if (change.cellType !== undefined) {
          if (change.cellType === null) delete cellTypes[change.fieldId];
          else cellTypes[change.fieldId] = change.cellType;
        }
      }
      return { ...row, cells, cellTypes };
    });

  const rows = insertPositioned(
    realRows,
    draft.newRows.map((r) => ({
      position: r.position,
      item: toVirtualRow(table.id, r),
    })),
  );

  return { ...table, fields, rows };
}

/** Удобный реэкспорт для UI: строка «ещё не на сервере». */
export const isVirtualRow = (id: string): boolean => isTempId(id);
export const isVirtualField = (id: string): boolean => isTempId(id);
