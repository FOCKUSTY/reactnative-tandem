import type { Field, TableRowData } from "../../types/table.types";

/**
 * Модуль формул таблиц.
 *
 * Отличие формулы от обычного текста — наличие выражения в двойных фигурных
 * скобках: `{{ ... }}`. Ячейка может содержать обычный текст и одно или
 * несколько выражений, например: `Итого: {{ сумма(С1Р1:С1Р10) }} руб.`.
 * Исходный текст с шаблоном хранится на бэкенде, отображается результат.
 */

/** Коды ошибок в стиле формул — кириллицей, чтобы пользователь читал их. */
export type FormulaErrorCode =
  "#ЦИКЛ!" | "#ДЕЛ/0!" | "#ИМЯ?" | "#ССЫЛКА!" | "#ЗНАЧ!" | "#ОШИБКА!";

export type FormulaResult =
  | { kind: "value"; value: string }
  | { kind: "error"; code: FormulaErrorCode; message?: string };

/** 1-based ссылка на ячейку. *FromEnd — считать с конца таблицы. */
export interface CellRef {
  col: number;
  row: number;
  colFromEnd: boolean;
  rowFromEnd: boolean;
}

export interface CellRange {
  from: CellRef;
  to: CellRef;
}

export interface ParsedTemplate {
  expressions: string[];
  hasTemplate: boolean;
}

export interface FormulaTableSnapshot {
  fields: Field[];
  rows: TableRowData[];
}

/** Карта отрендеренных значений: `${rowId}:${fieldId}` → текст. */
export type RenderedCellMap = Map<string, string>;

export const HAS_TEMPLATE_REGEX = /\{\{\s*[\s\S]*?\s*\}\}/;

/** Есть ли в тексте хотя бы одно выражение вида `{{ ... }}`. */
export const hasTemplate = (raw: string | null | undefined): boolean =>
  typeof raw === "string" && HAS_TEMPLATE_REGEX.test(raw);

/** Человекочитаемое описание кода ошибки — для справки и логов. */
export const describeFormulaError = (code: FormulaErrorCode): string => {
  switch (code) {
    case "#ЦИКЛ!":
      return "Циклическая ссылка";
    case "#ДЕЛ/0!":
      return "Деление на ноль";
    case "#ИМЯ?":
      return "Неизвестное поле или функция";
    case "#ЗНАЧ!":
      return "Несовместимый тип значения";
    case "#ССЫЛКА!":
      return "Ссылка за пределами таблицы";
    default:
      return "Синтаксическая ошибка";
  }
};
