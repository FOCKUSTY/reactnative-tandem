import { useCallback, useSyncExternalStore } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { tablesService } from "../../api/services/tables.service";
import { logger } from "../../utils";
import {
  draftStore,
  isDraftEmpty,
  isTempId,
  EMPTY_DRAFT_REF,
  type CellChange,
  type NewFieldDraft,
  type NewRowDraft,
  type TableDraft,
} from "./draft-store";

export type SaveAllResult = {
  total: number;
  succeeded: number;
  failed: number;
};

const keyOf = (rowId: string, fieldId: string) => `${rowId}:${fieldId}`;

/**
 * Черновик таблицы. Копит правки ячеек, новые столбцы и новые строки и
 * отправляет всё одним «пакетом» по кнопке «Сохранить».
 *
 * Пакет — не транзакция, а последовательность REST-вызовов (batch-эндпоинта
 * у бэкенда нет). Поэтому сохраняем аккуратно: результат каждой успешной
 * операции сразу публикуется в store, чтобы при падении на середине черновик
 * отражал только то, что не долетело.
 */
export const useTableDraft = (tableId: string | undefined) => {
  const queryClient = useQueryClient();

  const draft: Readonly<TableDraft> = useSyncExternalStore(
    draftStore.subscribe,
    () => (tableId ? draftStore.getTableDraft(tableId) : EMPTY_DRAFT_REF),
    () => (tableId ? draftStore.getTableDraft(tableId) : EMPTY_DRAFT_REF),
  );

  const changeCount =
    draft.cellChanges.size + draft.newFields.length + draft.newRows.length;
  const hasChanges = changeCount > 0;

  const setChange = useCallback(
    (change: CellChange) => {
      if (!tableId) return;
      draftStore.setChange(tableId, change);
    },
    [tableId],
  );

  const clearChange = useCallback(
    (rowId: string, fieldId: string) => {
      if (!tableId) return;
      draftStore.clearChange(tableId, rowId, fieldId);
    },
    [tableId],
  );

  const addField = useCallback(
    (field: NewFieldDraft) => {
      if (!tableId) return;
      draftStore.addField(tableId, field);
    },
    [tableId],
  );

  const updateField = useCallback(
    (
      tempId: string,
      patch: Partial<
        Pick<
          NewFieldDraft,
          "name" | "required" | "options" | "defaultValue" | "type"
        >
      >,
    ) => {
      if (!tableId) return;
      draftStore.updateField(tableId, tempId, patch);
    },
    [tableId],
  );

  const removeField = useCallback(
    (tempId: string) => {
      if (!tableId) return;
      draftStore.removeField(tableId, tempId);
    },
    [tableId],
  );

  const addRow = useCallback(
    (row: NewRowDraft) => {
      if (!tableId) return;
      draftStore.addRow(tableId, row);
    },
    [tableId],
  );

  const removeRow = useCallback(
    (tempId: string) => {
      if (!tableId) return;
      draftStore.removeRow(tableId, tempId);
    },
    [tableId],
  );

  const discardAll = useCallback(() => {
    if (!tableId) return;
    draftStore.clearTable(tableId);
  }, [tableId]);

  /**
   * Сохраняет черновик по шагам:
   *   1. Создаёт новые столбцы — по одному, чтобы сохранить порядок и
   *      зафиксировать маппинг tempId → реальный id.
   *   2. Создаёт новые строки — по одной, чтобы позиционирование сработало
   *      так же, как если бы пользователь вставлял их вживую. Ячейки внутри
   *      строки сохраняются параллельно.
   *   3. Досылает оставшиеся правки ячеек существующих строк.
   *
   * Каждый успех сразу публикуется в store. Если что-то упало, оно остаётся
   * в черновике — можно нажать «Сохранить» ещё раз, дубликаты не создадутся.
   */
  const saveAll = useCallback(async (): Promise<SaveAllResult> => {
    if (!tableId) return { total: 0, succeeded: 0, failed: 0 };

    const initial = draftStore.getTableDraft(tableId) as TableDraft;
    if (isDraftEmpty(initial)) {
      return { total: 0, succeeded: 0, failed: 0 };
    }

    const total =
      initial.cellChanges.size +
      initial.newFields.length +
      initial.newRows.length;

    let working: TableDraft = {
      cellChanges: new Map(initial.cellChanges),
      newFields: [...initial.newFields],
      newRows: [...initial.newRows],
    };
    let succeeded = 0;

    const commit = (next: TableDraft) => {
      working = next;
      draftStore.replaceTable(tableId, next);
    };

    for (const field of [...working.newFields]) {
      try {
        const res = await tablesService.createField(tableId, {
          name: field.name,
          type: field.type,
          required: field.required,
          options: field.options,
          defaultValue: field.defaultValue,
        });
        const realId = res.data.id;

        working = remapField(working, field.tempId, realId);
        commit(working);
        succeeded += 1;
      } catch (error) {
        void logger.warn("Draft field failed to save", {
          tableId,
          tempId: field.tempId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    for (const row of [...working.newRows]) {
      try {
        const res = await tablesService.createRow(tableId, {
          position: row.position,
        });
        const realRowId = res.data.id;

        const pendingCells: CellChange[] = [];
        await Promise.all(
          Object.entries(row.cells).map(async ([fieldIdOrTemp, value]) => {
            const cellType = row.cellTypes[fieldIdOrTemp];

            if (isTempId(fieldIdOrTemp)) {
              pendingCells.push({
                rowId: realRowId,
                fieldId: fieldIdOrTemp,
                value,
                cellType,
              });
              return;
            }

            try {
              await tablesService.createOrUpdateCell({
                rowId: realRowId,
                fieldId: fieldIdOrTemp,
                value,
                ...(cellType !== undefined ? { cellType } : {}),
              });
              succeeded += 1;
            } catch (error) {
              pendingCells.push({
                rowId: realRowId,
                fieldId: fieldIdOrTemp,
                value,
                cellType,
              });
              void logger.warn("Draft cell (new row) failed to save", {
                tableId,
                realRowId,
                fieldId: fieldIdOrTemp,
                error: error instanceof Error ? error.message : String(error),
              });
            }
          }),
        );

        const cellChanges = new Map(working.cellChanges);
        for (const c of pendingCells) {
          cellChanges.set(keyOf(c.rowId, c.fieldId), c);
        }
        commit({
          cellChanges,
          newFields: working.newFields,
          newRows: working.newRows.filter((r) => r.tempId !== row.tempId),
        });
        succeeded += 1;
      } catch (error) {
        void logger.warn("Draft row failed to save", {
          tableId,
          tempId: row.tempId,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    // --- Шаг 3. Правки ячеек существующих строк.
    const remainingCells: CellChange[] = [];
    await Promise.all(
      [...working.cellChanges.values()].map(async (change) => {
        // Поле ещё не создано — трогать ячейку нельзя.
        if (isTempId(change.fieldId)) {
          remainingCells.push(change);
          return;
        }

        try {
          await tablesService.createOrUpdateCell({
            rowId: change.rowId,
            fieldId: change.fieldId,
            value: change.value,
            ...(change.cellType !== undefined
              ? { cellType: change.cellType }
              : {}),
          });
          succeeded += 1;
        } catch (error) {
          remainingCells.push(change);
          void logger.warn("Draft cell failed to save", {
            tableId,
            change,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }),
    );

    commit({
      cellChanges: new Map(
        remainingCells.map((c) => [keyOf(c.rowId, c.fieldId), c] as const),
      ),
      newFields: working.newFields,
      newRows: working.newRows,
    });

    queryClient.invalidateQueries({ queryKey: ["table", tableId] });
    queryClient.invalidateQueries({ queryKey: ["tables"] });

    return { total, succeeded, failed: total - succeeded };
  }, [tableId, queryClient]);

  return {
    draft,
    changeCount,
    hasChanges,
    setChange,
    clearChange,
    addField,
    updateField,
    removeField,
    addRow,
    removeRow,
    discardAll,
    saveAll,
  };
};

/**
 * Локальная копия remapField — не тянем её из store, чтобы hook не мутировал
 * store напрямую, а работал через commit. Логика идентична.
 */
function remapField(
  draft: TableDraft,
  tempId: string,
  realId: string,
): TableDraft {
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
}
