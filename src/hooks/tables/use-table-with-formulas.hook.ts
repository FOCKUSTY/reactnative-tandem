import { useMemo } from "react";

import type { TableWithRecordRows } from "../../types";
import { computeTableFormulas } from "../../tables/formula";
import type { RenderedCellMap } from "../../tables/formula";
import { applyDraftToTable, useTableDraft } from "../../tables/draft";
import { useTable } from "./use-tables.hook";

export const useTableWithFormulas = (tableId: string) => {
  const query = useTable(tableId);
  const draftApi = useTableDraft(tableId);
  const originalTable = query.data as TableWithRecordRows | undefined;

  const table = useMemo(() => {
    if (!originalTable) return undefined;
    return applyDraftToTable(originalTable, draftApi.draft);
  }, [originalTable, draftApi.draft]);

  const renderedCells: RenderedCellMap | undefined = useMemo(() => {
    if (!table) return undefined;
    return computeTableFormulas(table.fields, table.rows);
  }, [table]);

  return {
    ...query,
    table,
    renderedCells,
    draft: draftApi,
  };
};
