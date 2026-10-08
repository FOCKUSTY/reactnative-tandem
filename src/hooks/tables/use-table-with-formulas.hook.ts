import { useMemo } from "react";

import type { TableWithRecordRows } from "../../types";
import { computeTableFormulas } from "../../tables/formula";
import type { RenderedCellMap } from "../../tables/formula";
import { useTable } from "./use-tables.hook";

/**
 * Обёртка над useTable: возвращает таблицу и карту отрендеренных ячеек.
 *
 * Формулы пересчитываются только при изменении снимка таблицы — react-query
 * отдаёт новый объект при инвалидации `["table", tableId]`, useMemo
 * пересчитывает карту, компоненты получают свежие значения.
 */
export const useTableWithFormulas = (tableId: string) => {
  const query = useTable(tableId);
  const table = query.data as TableWithRecordRows | undefined;

  const renderedCells: RenderedCellMap | undefined = useMemo(() => {
    if (!table) return undefined;
    return computeTableFormulas(table.fields, table.rows);
  }, [table]);

  return { ...query, table, renderedCells };
};
