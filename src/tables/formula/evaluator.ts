import { Parser } from "expr-eval";

import type { Field, TableRowData } from "../../types/table.types";
import { logger } from "../../utils";
import { formulaFunctions, FormulaError } from "./functions";
import { preprocessExpression, TEMPLATE_REGEX } from "./parser";
import {
  iterateRange,
  parseCellRange,
  parseCellRef,
  rangeSize,
  resolveCellRef,
} from "./references";
import { hasTemplate, type FormulaResult, type RenderedCellMap } from "./types";

const MAX_DEPTH = 50;
const MAX_RANGE_SIZE = 10_000;

/**
 * Движок формул таблицы.
 *
 * Ячейка рендерится целиком: все `{{ ... }}` внутри текста заменяются на
 * результат вычисления соответствующего выражения. Значения зависимых ячеек
 * вычисляются лениво и мемоизируются, а `inProgress` служит стеком для
 * обнаружения циклов (A→B→A вернёт #ЦИКЛ! вместо бесконечной рекурсии).
 */
export class TableFormulaEngine {
  private readonly parser = new Parser();
  private readonly cache = new Map<string, FormulaResult>();
  private readonly inProgress = new Set<string>();
  private depth = 0;
  private readonly rowStack: string[] = [];

  private readonly fieldsByOrder: Field[];
  private readonly rowsByOrder: TableRowData[];
  private readonly fieldById: Map<string, Field>;
  private readonly rowById: Map<string, TableRowData>;
  private readonly fieldByName: Map<string, Field>;

  constructor(fields: Field[], rows: TableRowData[]) {
    this.parser.functions = {
      ...this.parser.functions,
      ...formulaFunctions,
      GET_CELL: (ref: string) => this.resolveCell(ref),
      RANGE: (from: string, to: string) => this.resolveRange(from, to),
      GET_FIELD: (name: string) => this.resolveField(name),
    };
    this.fieldsByOrder = [...fields].sort((a, b) => a.order - b.order);
    this.rowsByOrder = [...rows].sort((a, b) => a.order - b.order);
    this.fieldById = new Map(fields.map((f) => [f.id, f]));
    this.rowById = new Map(rows.map((r) => [r.id, r]));
    this.fieldByName = new Map(fields.map((f) => [f.name, f]));
  }

  /** Считает все ячейки: `${rowId}:${fieldId}` → отрендеренный текст. */
  computeAll(): RenderedCellMap {
    const out: RenderedCellMap = new Map();
    for (const row of this.rowsByOrder) {
      for (const field of this.fieldsByOrder) {
        const result = this.renderCell(row.id, field.id);
        out.set(
          `${row.id}:${field.id}`,
          result.kind === "value" ? result.value : result.code,
        );
      }
    }
    return out;
  }

  /** Рендерит одну ячейку. Если шаблонов нет — возвращает текст как есть. */
  renderCell(rowId: string, fieldId: string): FormulaResult {
    const key = `${rowId}:${fieldId}`;
    const cached = this.cache.get(key);
    if (cached) return cached;

    const row = this.rowById.get(rowId);
    const field = this.fieldById.get(fieldId);
    if (!row || !field) {
      const err: FormulaResult = { kind: "error", code: "#ССЫЛКА!" };
      this.cache.set(key, err);
      return err;
    }

    const raw = row.cells[field.id] ?? "";
    if (!hasTemplate(raw)) {
      const res: FormulaResult = { kind: "value", value: raw };
      this.cache.set(key, res);
      return res;
    }

    if (this.inProgress.has(key)) {
      return { kind: "error", code: "#ЦИКЛ!" };
    }
    if (this.depth >= MAX_DEPTH) {
      void logger.warn("Formula depth limit reached", { rowId, fieldId });
      return {
        kind: "error",
        code: "#ЦИКЛ!",
        message: "Превышена максимальная глубина вычислений",
      };
    }

    this.inProgress.add(key);
    this.depth++;
    this.rowStack.push(rowId);
    let result: FormulaResult;
    try {
      const regex = new RegExp(TEMPLATE_REGEX.source, "g");
      const rendered = raw.replace(regex, (_, expr: string) => {
        try {
          const value = this.evaluateExpression(expr, rowId);
          if (value === null || value === undefined) return "";
          return String(value);
        } catch (e) {
          if (e instanceof FormulaError) {
            void logger.warn("Formula evaluation failed", {
              rowId,
              fieldId,
              expression: expr,
              code: e.code,
            });
            return e.code;
          }
          void logger.warn("Formula evaluation crashed", {
            rowId,
            fieldId,
            expression: expr,
            message: e instanceof Error ? e.message : String(e),
          });
          return "#ОШИБКА!";
        }
      });
      result = { kind: "value", value: rendered };
    } finally {
      this.rowStack.pop();
      this.depth--;
      this.inProgress.delete(key);
    }

    this.cache.set(key, result);
    return result;
  }

  private evaluateExpression(expr: string, rowId: string): unknown {
    if (!expr.trim()) return "";
    const prepared = preprocessExpression(expr);
    const parsed = this.parser.parse(prepared);
    return parsed.evaluate({ __rowId: rowId });
  }

  private resolveCell(ref: string): unknown {
    const parsed = parseCellRef(ref);
    if (!parsed) throw new FormulaError("#ССЫЛКА!");
    const resolved = resolveCellRef(
      parsed,
      this.fieldsByOrder.length,
      this.rowsByOrder.length,
    );
    if (!resolved) throw new FormulaError("#ССЫЛКА!");
    const field = this.fieldsByOrder[resolved.col - 1];
    const row = this.rowsByOrder[resolved.row - 1];
    return this.readCellValue(row.id, field.id);
  }

  private resolveRange(from: string, to: string): unknown[] {
    const range = parseCellRange(`${from}:${to}`);
    if (!range) throw new FormulaError("#ССЫЛКА!");
    const size = rangeSize(range);
    if (size > MAX_RANGE_SIZE) {
      void logger.warn("Formula range too large", { from, to, size });
    }
    const out: unknown[] = [];
    for (const { col, row } of iterateRange(
      range,
      this.fieldsByOrder.length,
      this.rowsByOrder.length,
    )) {
      const field = this.fieldsByOrder[col - 1];
      const rowData = this.rowsByOrder[row - 1];
      out.push(this.readCellValue(rowData.id, field.id));
    }
    return out;
  }

  private resolveField(name: string): unknown {
    const rowId = this.rowStack[this.rowStack.length - 1];
    if (!rowId) throw new FormulaError("#ОШИБКА!");
    const field = this.fieldByName.get(name);
    if (!field) throw new FormulaError("#ИМЯ?", `Нет поля: ${name}`);
    return this.readCellValue(rowId, field.id);
  }

  private readCellValue(rowId: string, fieldId: string): unknown {
    const result = this.renderCell(rowId, fieldId);
    if (result.kind === "error") {
      throw new FormulaError(result.code, result.message);
    }
    return normalizeValue(result.value);
  }
}

/**
 * Если отрендеренный текст похож на число — возвращаем число,
 * иначе строку. Так `С1Р1 + С1Р2` работает как арифметика,
 * а `[Дата]` остаётся строкой для formatDate.
 */
const normalizeValue = (raw: string): unknown => {
  const trimmed = raw.trim().replace(",", ".");
  if (trimmed === "") return "";
  const n = Number(trimmed);
  if (!Number.isNaN(n) && Number.isFinite(n)) return n;
  return raw;
};

/** Удобный хелпер: посчитать всю таблицу за один вызов. */
export function renderTableCells(
  fields: Field[],
  rows: TableRowData[],
): RenderedCellMap {
  return new TableFormulaEngine(fields, rows).computeAll();
}
