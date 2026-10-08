import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TableRowData } from "../../types/table.types";
import { tablesService } from "../../api/services/tables.service";

/**
 * Вставка строки на конкретную позицию.
 *
 * Бэкенд умеет только `createRow` (в конец) и `reorderRows(ids)`.
 * Поэтому порядок действий такой:
 *   1. создать пустую строку;
 *   2. собрать новый порядок ids с вставкой в нужное место;
 *   3. отправить reorderRows — сервер расставит order по позиции в массиве.
 */
export const useInsertRow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      tableId,
      rows,
      referenceRowId,
      position,
    }: {
      tableId: string;
      rows: TableRowData[];
      referenceRowId: string;
      position: "above" | "below";
    }) => {
      const created = await tablesService.createRow(tableId, {});
      const newRowId = created.data.id;

      const refIndex = rows.findIndex((r) => r.id === referenceRowId);
      if (refIndex < 0) {
        throw new Error("Строка для вставки не найдена");
      }
      const insertIndex = position === "above" ? refIndex : refIndex + 1;

      const ids = rows.map((r) => r.id);
      ids.splice(insertIndex, 0, newRowId);

      await tablesService.reorderRows({ tableId, ids });
      return created.data;
    },
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: ["table", tableId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    },
  });
};
