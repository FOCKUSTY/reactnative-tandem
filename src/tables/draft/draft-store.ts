import type { FieldType } from "../../types/table.types";

export type CellChange = {
  rowId: string;
  fieldId: string;
  value: string;
  /** `undefined` — не трогать override; `null` — снять; `FieldType` — поставить. */
  cellType?: FieldType | null;
};

/** Новый столбец, ещё не отправленный на сервер. */
export type NewFieldDraft = {
  tempId: string;
  name: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
  defaultValue?: string | null;
};

/** Новая строка, ещё не отправленная на сервер. */
export type NewRowDraft = {
  tempId: string;
  /**
   * Куда вставить строку на сервере (1-based, отрицательные считаются с конца,
   * как `CreateRowDto.position`). `-1` — в конец.
   */
  position: number;
  /** Значения ячеек: ключ — реальный `fieldId` или `tempId` нового поля. */
  cells: Record<string, string>;
  /** Override'ы типов ячеек: ключ — реальный `fieldId` или `tempId`. */
  cellTypes: Record<string, FieldType>;
};

export type TableDraft = {
  cellChanges: Map<string, CellChange>;
  newFields: NewFieldDraft[];
  newRows: NewRowDraft[];
};

const EMPTY_TABLE_DRAFT: TableDraft = {
  cellChanges: new Map(),
  newFields: [],
  newRows: [],
};

/** Стабильная ссылка для useSyncExternalStore. */
export const EMPTY_DRAFT_REF: Readonly<TableDraft> = EMPTY_TABLE_DRAFT;

const TEMP_PREFIX = "new_";
let tempCounter = 0;

/** Свежий временный ID: используется до тех пор, пока сущность не сохранена. */
export const makeTempId = (kind: "row" | "field"): string =>
  `${TEMP_PREFIX}${kind}_${Date.now().toString(36)}_${++tempCounter}`;

export const isTempId = (id: string): boolean => id.startsWith(TEMP_PREFIX);

export const isDraftEmpty = (draft: TableDraft): boolean =>
  draft.cellChanges.size === 0 &&
  draft.newFields.length === 0 &&
  draft.newRows.length === 0;

const keyOf = (rowId: string, fieldId: string) => `${rowId}:${fieldId}`;

const drafts = new Map<string, TableDraft>();
const listeners = new Set<() => void>();

const emit = () => {
  for (const listener of [...listeners]) {
    try {
      listener();
    } catch {}
  }
};

const getOrCreate = (tableId: string): TableDraft =>
  drafts.get(tableId) ?? EMPTY_TABLE_DRAFT;

const commit = (tableId: string, next: TableDraft): void => {
  if (isDraftEmpty(next)) drafts.delete(tableId);
  else drafts.set(tableId, next);
  emit();
};

/** Заменяет все ссылки на старый tempId поля новым (реальным) id. */
const remapField = (
  draft: TableDraft,
  tempId: string,
  realId: string,
): TableDraft => {
  const cellChanges = new Map<string, CellChange>();
  for (const change of draft.cellChanges.values()) {
    if (change.fieldId === tempId) {
      const next: CellChange = { ...change, fieldId: realId };
      cellChanges.set(keyOf(next.rowId, next.fieldId), next);
    } else {
      cellChanges.set(keyOf(change.rowId, change.fieldId), change);
    }
  }

  const newRows = draft.newRows.map((row) => {
    if (!(tempId in row.cells)) return row;
    const cells = { ...row.cells };
    const cellTypes = { ...row.cellTypes };
    cells[realId] = cells[tempId];
    delete cells[tempId];
    if (tempId in cellTypes) {
      cellTypes[realId] = cellTypes[tempId];
      delete cellTypes[tempId];
    }
    return { ...row, cells, cellTypes };
  });

  return {
    cellChanges,
    newFields: draft.newFields.filter((f) => f.tempId !== tempId),
    newRows,
  };
};

export const draftStore = {
  getTableDraft(tableId: string): Readonly<TableDraft> {
    return getOrCreate(tableId);
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /**
   * Универсальный сеттер ячейки.
   *  - `rowId` — реальный → правка уходит в `cellChanges`;
   *  - `rowId` — tempId нового ряда → значение пишется в `newRows[].cells`.
   */
  setChange(tableId: string, change: CellChange): void {
    const current = getOrCreate(tableId);

    if (isTempId(change.rowId)) {
      const newRows = current.newRows.map((row) => {
        if (row.tempId !== change.rowId) return row;
        const cells = { ...row.cells, [change.fieldId]: change.value };
        const cellTypes = { ...row.cellTypes };
        if (change.cellType !== undefined) {
          if (change.cellType === null) delete cellTypes[change.fieldId];
          else cellTypes[change.fieldId] = change.cellType;
        }
        return { ...row, cells, cellTypes };
      });
      commit(tableId, { ...current, newRows });
      return;
    }

    const cellChanges = new Map(current.cellChanges);
    cellChanges.set(keyOf(change.rowId, change.fieldId), change);
    commit(tableId, { ...current, cellChanges });
  },

  clearChange(tableId: string, rowId: string, fieldId: string): void {
    const current = getOrCreate(tableId);

    if (isTempId(rowId)) {
      const newRows = current.newRows.map((row) => {
        if (row.tempId !== rowId) return row;
        const cells = { ...row.cells };
        const cellTypes = { ...row.cellTypes };
        delete cells[fieldId];
        delete cellTypes[fieldId];
        return { ...row, cells, cellTypes };
      });
      commit(tableId, { ...current, newRows });
      return;
    }

    if (!current.cellChanges.has(keyOf(rowId, fieldId))) return;
    const cellChanges = new Map(current.cellChanges);
    cellChanges.delete(keyOf(rowId, fieldId));
    commit(tableId, { ...current, cellChanges });
  },

  addField(tableId: string, field: NewFieldDraft): void {
    const current = getOrCreate(tableId);
    commit(tableId, { ...current, newFields: [...current.newFields, field] });
  },

  updateField(
    tableId: string,
    tempId: string,
    patch: Partial<
      Pick<
        NewFieldDraft,
        "name" | "required" | "options" | "defaultValue" | "type"
      >
    >,
  ): void {
    const current = getOrCreate(tableId);
    const newFields = current.newFields.map((f) =>
      f.tempId === tempId ? { ...f, ...patch } : f,
    );
    commit(tableId, { ...current, newFields });
  },

  removeField(tableId: string, tempId: string): void {
    const current = getOrCreate(tableId);

    const newFields = current.newFields.filter((f) => f.tempId !== tempId);

    const cellChanges = new Map<string, CellChange>();
    for (const change of current.cellChanges.values()) {
      if (change.fieldId === tempId) continue;
      cellChanges.set(keyOf(change.rowId, change.fieldId), change);
    }

    const newRows = current.newRows.map((row) => {
      if (!(tempId in row.cells)) return row;
      const cells = { ...row.cells };
      const cellTypes = { ...row.cellTypes };
      delete cells[tempId];
      delete cellTypes[tempId];
      return { ...row, cells, cellTypes };
    });

    commit(tableId, { cellChanges, newFields, newRows });
  },

  addRow(tableId: string, row: NewRowDraft): void {
    const current = getOrCreate(tableId);
    commit(tableId, { ...current, newRows: [...current.newRows, row] });
  },

  removeRow(tableId: string, tempId: string): void {
    const current = getOrCreate(tableId);
    const newRows = current.newRows.filter((r) => r.tempId !== tempId);

    const cellChanges = new Map<string, CellChange>();
    for (const change of current.cellChanges.values()) {
      if (change.rowId === tempId) continue;
      cellChanges.set(keyOf(change.rowId, change.fieldId), change);
    }

    commit(tableId, { cellChanges, newFields: current.newFields, newRows });
  },

  clearTable(tableId: string): void {
    if (!drafts.has(tableId)) return;
    drafts.delete(tableId);
    emit();
  },

  /**
   * Заменяет черновик целиком. Используется `saveAll`, чтобы публиковать
   * промежуточные состояния: если сохранение упало на середине, черновик
   * уже отражает то, что успешно улетело на сервер.
   */
  replaceTable(tableId: string, next: TableDraft): void {
    commit(tableId, next);
  },

  /** Служебное — для `saveAll`: заменить все ссылки temp-поля на реальный id. */
  remapField(tableId: string, tempId: string, realId: string): void {
    const current = getOrCreate(tableId);
    commit(tableId, remapField(current, tempId, realId));
  },
};
