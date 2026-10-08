import type { Field, TableRowData } from "../../types/table.types";
import { TableFormulaEngine } from "./evaluator";
import type { RenderedCellMap } from "./types";

/**
 * Точка входа: считает формулы по всему снимку таблицы.
 *
 * Возвращает Map, где ключ — `${rowId}:${fieldId}`, значение — либо
 * отрендеренный текст, либо код ошибки (#ЦИКЛ! и т.п.). Компонент TableRow
 * читает уже готовое значение и не занимается вычислениями.
 */
export function computeTableFormulas(
  fields: Field[],
  rows: TableRowData[],
): RenderedCellMap {
  return new TableFormulaEngine(fields, rows).computeAll();
}

export function pickRendered(
  map: RenderedCellMap | undefined,
  rowId: string,
  fieldId: string,
): string | undefined {
  return map?.get(`${rowId}:${fieldId}`);
}
