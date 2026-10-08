MPC-PATH: src/tables/formula/types.ts
MPC-CONTENT
+import type { Field, TableRowData } from "../../types/table.types"; +
+/**

- - Модуль формул таблиц.
- -
- - Отличие формулы от обычного текста — наличие выражения в двойных фигурных
- - скобках: `{{ ... }}`. Ячейка может содержать обычный текст и одно или
- - несколько выражений, например: `Итого: {{ сумма(С1Р1:С1Р10) }} руб.`.
- - Исходный текст с шаблоном хранится на бэкенде, отображается результат.
- */
-

+/** Коды ошибок в стиле формул — кириллицей, чтобы пользователь читал их. */
+export type FormulaErrorCode =

- | "#ЦИКЛ!"
- | "#ДЕЛ/0!"
- | "#ИМЯ?"
- | "#ССЫЛКА!"
- | "#ЗНАЧ!"
- | "#ОШИБКА!";
-

+export type FormulaResult =

- | { kind: "value"; value: string }
- | { kind: "error"; code: FormulaErrorCode; message?: string };
-

+/** 1-based ссылка на ячейку. *FromEnd — считать с конца таблицы. */
+export interface CellRef {

- col: number;
- row: number;
- colFromEnd: boolean;
- rowFromEnd: boolean;
  +}
-

+export interface CellRange {

- from: CellRef;
- to: CellRef;
  +}
-

+export interface ParsedTemplate {

- expressions: string[];
- hasTemplate: boolean;
  +}
-

+export interface FormulaTableSnapshot {

- fields: Field[];
- rows: TableRowData[];
  +}
-

+/** Карта отрендеренных значений: `${rowId}:${fieldId}` → текст. _/
+export type RenderedCellMap = Map<string, string>; +
+export const HAS_TEMPLATE_REGEX = /\{\{\s_[\s\S]_?\s_\}\}/; +
+/** Есть ли в тексте хотя бы одно выражение вида `{{ ... }}`. */
+export const hasTemplate = (raw: string | null | undefined): boolean =>

- typeof raw === "string" && HAS_TEMPLATE_REGEX.test(raw);
-

+/** Человекочитаемое описание кода ошибки — для справки и логов. */
+export const describeFormulaError = (code: FormulaErrorCode): string => {

- switch (code) {
- case "#ЦИКЛ!":
-      return "Циклическая ссылка";
- case "#ДЕЛ/0!":
-      return "Деление на ноль";
- case "#ИМЯ?":
-      return "Неизвестное поле или функция";
- case "#ЗНАЧ!":
-      return "Несовместимый тип значения";
- case "#ССЫЛКА!":
-      return "Ссылка за пределами таблицы";
- default:
-      return "Синтаксическая ошибка";
- }
  +};
  MPC-END

MPC-PATH: src/tables/formula/references.ts
MPC-CONTENT
+/**

- - Разбор ссылок на ячейки в стиле «С1Р1».
- -
- - С — столбец, Р — ряд (строка). Принимаем и кириллические С/Р, и латинские
- - C/P в любом регистре — пользователь не должен думать о раскладке.
- - Индексы считаются с 1. Отрицательный индекс означает «отсчёт с конца»:
- - С-1 — последний столбец, С-2 — предпоследний и так далее. Диапазон
- - записывается через двоеточие: С1Р1:С3Р5 — прямоугольник.
- */
-

+import type { CellRange, CellRef } from "./types"; +
+const CELL_REF_BODY = "[Cc]-?\\d+[Pp]-?\\d+";
+const CELL_REF_REGEX = new RegExp(CELL_REF_BODY, "g");
+const RANGE_REGEX = new RegExp(

- `(${CELL_REF_BODY})\\s*:\\s*(${CELL_REF_BODY})`,
- "g",
  +);
-

+/** С/с → C, Р/р → P. Так ссылки и функции приводятся к одной раскладке. */
+export function normalizeRefString(s: string): string {

- return s.replace(/[Сс]/g, "C").replace(/[Рр]/g, "P");
  +}
-

+/** Разбирает «С1Р1» / «c-1p-1». Возвращает null на мусоре. */
+export function parseCellRef(raw: string): CellRef | null {

- const normalized = normalizeRefString(raw).trim();
- const m = normalized.match(/^C(-?\d+)P(-?\d+)$/i);
- if (!m) return null;
- const colRaw = parseInt(m[1], 10);
- const rowRaw = parseInt(m[2], 10);
- if (colRaw === 0 || rowRaw === 0) return null;
- return {
- col: Math.abs(colRaw),
- row: Math.abs(rowRaw),
- colFromEnd: colRaw < 0,
- rowFromEnd: rowRaw < 0,
- };
  +}
-

+/**

- - Превращает абстрактную ссылку в конкретные (col, row) снимка.
- - Возвращает null, если ячейка выходит за пределы таблицы.
- */
  +export function resolveCellRef(
- ref: CellRef,
- fieldCount: number,
- rowCount: number,
  +): { col: number; row: number } | null {
- const col = ref.colFromEnd ? fieldCount - ref.col + 1 : ref.col;
- const row = ref.rowFromEnd ? rowCount - ref.row + 1 : ref.row;
- if (col < 1 || col > fieldCount || row < 1 || row > rowCount) return null;
- return { col, row };
  +}
-

+/** Разбирает диапазон «С1Р1:С3Р5». Возвращает null на неверном формате. */
+export function parseCellRange(raw: string): CellRange | null {

- const normalized = normalizeRefString(raw).trim();
- const m = normalized.match(
- /^(C-?\d+P-?\d+)\s*:\s*(C-?\d+P-?\d+)$/i,
- );
- if (!m) return null;
- const from = parseCellRef(m[1]);
- const to = parseCellRef(m[2]);
- if (!from || !to) return null;
- return { from, to };
  +}
-

+/** Итерирует все ячейки прямоугольного диапазона в порядке следования. _/
+export function_ iterateRange(

- range: CellRange,
- fieldCount: number,
- rowCount: number,
  +): Generator<{ col: number; row: number }> {
- const a = resolveCellRef(range.from, fieldCount, rowCount);
- const b = resolveCellRef(range.to, fieldCount, rowCount);
- if (!a || !b) return;
- const c1 = Math.min(a.col, b.col);
- const c2 = Math.max(a.col, b.col);
- const r1 = Math.min(a.row, b.row);
- const r2 = Math.max(a.row, b.row);
- for (let r = r1; r <= r2; r++) {
- for (let c = c1; c <= c2; c++) {
-      yield { col: c, row: r };
- }
- }
  +}
-

+export function rangeSize(range: CellRange): number {

- return (
- (Math.abs(range.from.row - range.to.row) + 1) *
- (Math.abs(range.from.col - range.to.col) + 1)
- );
  +}
-

+/**

- - Извлекает из строки все ссылки на ячейки и диапазоны (для карты
- - зависимостей и для подсветки). Ссылки внутри `[ ... ]` игнорируются —
- - это имена полей, а не адреса ячеек.
- */
  +export function extractCellRefs(expr: string): string[] {
- // Уберём содержимое квадратных скобок, чтобы не спутать имя поля с адресом.
- const stripped = expr.replace(/\[[^\]]*\]/g, "");
- const normalized = normalizeRefString(stripped);
- const out: string[] = [];
- let m: RegExpExecArray | null;
- const rangeRegex = new RegExp(RANGE_REGEX.source, "g");
- while ((m = rangeRegex.exec(normalized)) !== null) {
- out.push(`${m[1].toUpperCase()}:${m[2].toUpperCase()}`);
- }
- const cellRegex = new RegExp(CELL_REF_REGEX.source, "g");
- while ((m = cellRegex.exec(normalized)) !== null) {
- out.push(m[1].toUpperCase());
- }
- return out;
  +}
  MPC-END

MPC-PATH: src/tables/formula/parser.ts
MPC-CONTENT
+/**

- - Препроцессор выражений формул.
- -
- - Пользователь пишет выражения как в шаблонах записей — внутри `{{ ... }}`.
- - Здесь выражение приводится к синтаксису expr-eval:
- - [Имя поля] → GET_FIELD("Имя поля")
- - С1Р1 → GET_CELL("C1P1")
- - С1Р1:С3Р5 → RANGE("C1P1","C3P5")
- - сумма(...) → sum(...)
- -
- - expr-eval не понимает кириллицу в именах функций, поэтому русские
- - названия маппим на канонические английские.
- */
-

+import { normalizeRefString } from "./references"; +
+/** Русские имена функций и их синонимы → канонический expr-eval-идентификатор. */
+const FUNCTION_ALIASES: Record<string, string> = {

- сумма: "sum",
- summa: "sum",
- среднее: "avg",
- average: "avg",
- mean: "avg",
- мин: "min",
- макс: "max",
- количество: "count",
- счёт: "counta",
- счет: "counta",
- округл: "round",
- округ: "round",
- абс: "abs",
- если: "if",
- и: "and",
- или: "or",
- не: "not",
  +};
-

+/**

- - Заменяет узнанные имена функций (за которыми идёт открывающая скобка)
- - на канонические. Строковые литералы не трогаем.
- */
  +function translateFunctionNames(expr: string): string {
- const out: string[] = [];
- let i = 0;
- while (i < expr.length) {
- const ch = expr[i];
- if (ch === '"') {
-      let j = i + 1;
-      while (j < expr.length) {
-        if (expr[j] === "\\") j += 2;
-        else if (expr[j] === '"') {
-          j++;
-          break;
-        } else j++;
-      }
-      out.push(expr.slice(i, j));
-      i = j;
-      continue;
- }
- if (/[A-Za-zА-Яа-яЁё_]/.test(ch)) {
-      let j = i;
-      while (j < expr.length && /[A-Za-zА-Яа-яЁё0-9_]/.test(expr[j])) j++;
-      const ident = expr.slice(i, j);
-      let k = j;
-      while (k < expr.length && /\s/.test(expr[k])) k++;
-      const isCall = expr[k] === "(";
-      const key = ident.toLowerCase();
-      if (isCall && FUNCTION_ALIASES[key]) out.push(FUNCTION_ALIASES[key]);
-      else if (isCall) out.push(key);
-      else out.push(ident);
-      i = j;
-      continue;
- }
- out.push(ch);
- i++;
- }
- return out.join("");
  +}
-

+/**

- - Приводит пользовательское выражение к форме, понятной expr-eval.
- - Порядок важен: сначала защищаем `[Имя поля]` плейсхолдером, потом
- - нормализуем С/Р в C/P, потом ссылки на ячейки, потом имена функций.
- */
  +export function preprocessExpression(expr: string): string {
- const fields: string[] = [];
- let s = expr.replace(/\[([^\]]*)\]/g, (_, name: string) => {
- const idx = fields.length;
- fields.push(name);
- return `\u0000F${idx}\u0000`;
- });
-
- s = normalizeRefString(s);
-
- s = s.replace(
- /([Cc]-?\d+[Pp]-?\d+)\s*:\s*([Cc]-?\d+[Pp]-?\d+)/g,
- (_, a: string, b: string) =>
-      `RANGE(${JSON.stringify(a.toUpperCase())},${JSON.stringify(b.toUpperCase())})`,
- );
-
- s = s.replace(
- /([Cc]-?\d+[Pp]-?\d+)/g,
- (_, a: string) => `GET_CELL(${JSON.stringify(a.toUpperCase())})`,
- );
-
- s = translateFunctionNames(s);
-
- s = s.replace(/\u0000F(\d+)\u0000/g, (_, i: string) => {
- const name = fields[parseInt(i, 10)] ?? "";
- return `GET_FIELD(${JSON.stringify(name)})`;
- });
-
- return s;
  +}
-

+/** Имена полей, на которые ссылается выражение (для карты зависимостей). */
+export function extractFieldNames(expr: string): string[] {

- const out: string[] = [];
- const re = /\[([^\]]*)\]/g;
- let m: RegExpExecArray | null;
- while ((m = re.exec(expr)) !== null) out.push(m[1]);
- return out;
  +}
-

+/** Регулярка для `{{ ... }}` — переиспользуется и в рендере, и в тестах. _/
+export const TEMPLATE_REGEX = /\{\{\s_([\s\S]_?)\s_\}\}/g; +
+/** Возвращает все выражения из текста ячейки (без разделителей и скобок). */
+export function extractExpressions(text: string): string[] {

- const out: string[] = [];
- const re = new RegExp(TEMPLATE_REGEX.source, "g");
- let m: RegExpExecArray | null;
- while ((m = re.exec(text)) !== null) out.push(m[1]);
- return out;
  +}
  MPC-END

MPC-PATH: src/tables/formula/functions.ts
MPC-CONTENT
+import type { FormulaErrorCode } from "./types"; +
+/**

- - Встроенные функции формул и вспомогательные преобразования.
- -
- - expr-eval передаёт массивы (результат RANGE) как отдельные аргументы, когда
- - функция объявлена с rest-параметрами — поэтому SUM/AVG/… умеют принимать
- - и одиночные значения, и диапазоны вперемешку.
- */
-

+export class FormulaError extends Error {

- constructor(
- public code: FormulaErrorCode,
- message?: string,
- ) {
- super(message ?? code);
- this.name = "FormulaError";
- }
  +}
-

+const isEmpty = (v: unknown): boolean =>

- v === null || v === undefined || v === "";
-

+const flatten = (args: unknown[]): unknown[] => {

- const out: unknown[] = [];
- for (const a of args) {
- if (Array.isArray(a)) out.push(...flatten(a));
- else out.push(a);
- }
- return out;
  +};
-

+/** Числовое ли значение — строка тоже принимается, если парсится. */
+export function isNumeric(v: unknown): boolean {

- if (typeof v === "number") return Number.isFinite(v);
- if (typeof v === "boolean") return false;
- if (typeof v === "string") {
- const t = v.trim().replace(",", ".");
- return t !== "" && !Number.isNaN(Number(t));
- }
- return false;
  +}
-

+export function toNumber(v: unknown): number {

- if (typeof v === "number") return Number.isFinite(v) ? v : 0;
- if (typeof v === "boolean") return v ? 1 : 0;
- if (typeof v === "string") {
- const t = v.trim().replace(",", ".");
- if (t === "") return 0;
- const n = Number(t);
- if (Number.isNaN(n)) {
-      throw new FormulaError("#ЗНАЧ!", `Не число: ${v}`);
- }
- return n;
- }
- return 0;
  +}
-

+/** Мягкое приведение: для агрегатов текст превращаем в 0 без исключения. */
+const toNumberOrZero = (v: unknown): number => {

- try {
- return toNumber(v);
- } catch {
- return 0;
- }
  +};
-

+const isTruthy = (v: unknown): boolean => {

- if (typeof v === "boolean") return v;
- if (typeof v === "number") return v !== 0;
- if (typeof v === "string") {
- const t = v.trim().toLowerCase();
- return t !== "" && t !== "0" && t !== "false";
- }
- return false;
  +};
-

+export const formulaFunctions = {

- /** Сумма чисел. Пустые ячейки и текст — ноль. */
- sum: (...args: unknown[]): number =>
- flatten(args).reduce<number>((acc, v) => acc + toNumberOrZero(v), 0),
-
- /** Среднее арифметическое непустых значений. */
- avg: (...args: unknown[]): number => {
- const nums = flatten(args)
-      .filter((v) => !isEmpty(v))
-      .map(toNumberOrZero);
- if (nums.length === 0) return 0;
- return nums.reduce((a, b) => a + b, 0) / nums.length;
- },
-
- min: (...args: unknown[]): number => {
- const nums = flatten(args)
-      .filter((v) => !isEmpty(v))
-      .map(toNumberOrZero);
- return nums.length === 0 ? 0 : Math.min(...nums);
- },
-
- max: (...args: unknown[]): number => {
- const nums = flatten(args)
-      .filter((v) => !isEmpty(v))
-      .map(toNumberOrZero);
- return nums.length === 0 ? 0 : Math.max(...nums);
- },
-
- /** Сколько значений приводится к числу. */
- count: (...args: unknown[]): number =>
- flatten(args).filter(isNumeric).length,
-
- /** Сколько непустых значений (числа, текст, булевы). */
- counta: (...args: unknown[]): number =>
- flatten(args).filter((v) => !isEmpty(v)).length,
-
- round: (value: unknown, digits: unknown = 0): number => {
- const n = toNumber(value);
- const d = Math.max(0, Math.min(15, Math.trunc(toNumber(digits))));
- const factor = Math.pow(10, d);
- return Math.round(n * factor) / factor;
- },
-
- abs: (value: unknown): number => Math.abs(toNumber(value)),
-
- if: (cond: unknown, a: unknown, b: unknown = ""): unknown =>
- isTruthy(cond) ? a : b,
-
- and: (...args: unknown[]): boolean => args.every(isTruthy),
- or: (...args: unknown[]): boolean => args.some(isTruthy),
- not: (v: unknown): boolean => !isTruthy(v),
  +};
-

+export type FormulaFunctionName = keyof typeof formulaFunctions;
MPC-END

MPC-PATH: src/tables/formula/evaluator.ts
MPC-CONTENT
+import { Parser } from "expr-eval"; +
+import type { Field, TableRowData } from "../../types/table.types";
+import { logger } from "../../utils";
+import { formulaFunctions, FormulaError } from "./functions";
+import { preprocessExpression, TEMPLATE_REGEX } from "./parser";
+import {

- iterateRange,
- parseCellRange,
- parseCellRef,
- rangeSize,
- resolveCellRef,
  +} from "./references";
  +import {
- hasTemplate,
- type FormulaResult,
- type RenderedCellMap,
  +} from "./types";
-

+const MAX_DEPTH = 50;
+const MAX_RANGE_SIZE = 10_000; +
+/**

- - Движок формул таблицы.
- -
- - Ячейка рендерится целиком: все `{{ ... }}` внутри текста заменяются на
- - результат вычисления соответствующего выражения. Значения зависимых ячеек
- - вычисляются лениво и мемоизируются, а `inProgress` служит стеком для
- - обнаружения циклов (A→B→A вернёт #ЦИКЛ! вместо бесконечной рекурсии).
- */
  +export class TableFormulaEngine {
- private readonly parser = new Parser();
- private readonly cache = new Map<string, FormulaResult>();
- private readonly inProgress = new Set<string>();
- private depth = 0;
- private readonly rowStack: string[] = [];
-
- private readonly fieldsByOrder: Field[];
- private readonly rowsByOrder: TableRowData[];
- private readonly fieldById: Map<string, Field>;
- private readonly rowById: Map<string, TableRowData>;
- private readonly fieldByName: Map<string, Field>;
-
- constructor(fields: Field[], rows: TableRowData[]) {
- this.parser.functions = {
-      ...this.parser.functions,
-      ...formulaFunctions,
-      GET_CELL: (ref: string) => this.resolveCell(ref),
-      RANGE: (from: string, to: string) => this.resolveRange(from, to),
-      GET_FIELD: (name: string) => this.resolveField(name),
- };
- this.fieldsByOrder = [...fields].sort((a, b) => a.order - b.order);
- this.rowsByOrder = [...rows].sort((a, b) => a.order - b.order);
- this.fieldById = new Map(fields.map((f) => [f.id, f]));
- this.rowById = new Map(rows.map((r) => [r.id, r]));
- this.fieldByName = new Map(fields.map((f) => [f.name, f]));
- }
-
- /** Считает все ячейки: `${rowId}:${fieldId}` → отрендеренный текст. */
- computeAll(): RenderedCellMap {
- const out: RenderedCellMap = new Map();
- for (const row of this.rowsByOrder) {
-      for (const field of this.fieldsByOrder) {
-        const result = this.renderCell(row.id, field.id);
-        out.set(
-          `${row.id}:${field.id}`,
-          result.kind === "value" ? result.value : result.code,
-        );
-      }
- }
- return out;
- }
-
- /** Рендерит одну ячейку. Если шаблонов нет — возвращает текст как есть. */
- renderCell(rowId: string, fieldId: string): FormulaResult {
- const key = `${rowId}:${fieldId}`;
- const cached = this.cache.get(key);
- if (cached) return cached;
-
- const row = this.rowById.get(rowId);
- const field = this.fieldById.get(fieldId);
- if (!row || !field) {
-      const err: FormulaResult = { kind: "error", code: "#ССЫЛКА!" };
-      this.cache.set(key, err);
-      return err;
- }
-
- const raw = row.cells[field.id] ?? "";
- if (!hasTemplate(raw)) {
-      const res: FormulaResult = { kind: "value", value: raw };
-      this.cache.set(key, res);
-      return res;
- }
-
- if (this.inProgress.has(key)) {
-      return { kind: "error", code: "#ЦИКЛ!" };
- }
- if (this.depth >= MAX_DEPTH) {
-      void logger.warn("Formula depth limit reached", { rowId, fieldId });
-      return {
-        kind: "error",
-        code: "#ЦИКЛ!",
-        message: "Превышена максимальная глубина вычислений",
-      };
- }
-
- this.inProgress.add(key);
- this.depth++;
- this.rowStack.push(rowId);
- let result: FormulaResult;
- try {
-      const regex = new RegExp(TEMPLATE_REGEX.source, "g");
-      const rendered = raw.replace(regex, (_, expr: string) => {
-        try {
-          const value = this.evaluateExpression(expr, rowId);
-          if (value === null || value === undefined) return "";
-          return String(value);
-        } catch (e) {
-          if (e instanceof FormulaError) {
-            void logger.warn("Formula evaluation failed", {
-              rowId,
-              fieldId,
-              expression: expr,
-              code: e.code,
-            });
-            return e.code;
-          }
-          void logger.warn("Formula evaluation crashed", {
-            rowId,
-            fieldId,
-            expression: expr,
-            message: e instanceof Error ? e.message : String(e),
-          });
-          return "#ОШИБКА!";
-        }
-      });
-      result = { kind: "value", value: rendered };
- } finally {
-      this.rowStack.pop();
-      this.depth--;
-      this.inProgress.delete(key);
- }
-
- this.cache.set(key, result);
- return result;
- }
-
- private evaluateExpression(expr: string, rowId: string): unknown {
- if (!expr.trim()) return "";
- const prepared = preprocessExpression(expr);
- const parsed = this.parser.parse(prepared);
- return parsed.evaluate({ __rowId: rowId });
- }
-
- private resolveCell(ref: string): unknown {
- const parsed = parseCellRef(ref);
- if (!parsed) throw new FormulaError("#ССЫЛКА!");
- const resolved = resolveCellRef(
-      parsed,
-      this.fieldsByOrder.length,
-      this.rowsByOrder.length,
- );
- if (!resolved) throw new FormulaError("#ССЫЛКА!");
- const field = this.fieldsByOrder[resolved.col - 1];
- const row = this.rowsByOrder[resolved.row - 1];
- return this.readCellValue(row.id, field.id);
- }
-
- private resolveRange(from: string, to: string): unknown[] {
- const range = parseCellRange(`${from}:${to}`);
- if (!range) throw new FormulaError("#ССЫЛКА!");
- const size = rangeSize(range);
- if (size > MAX_RANGE_SIZE) {
-      void logger.warn("Formula range too large", { from, to, size });
- }
- const out: unknown[] = [];
- for (const { col, row } of iterateRange(
-      range,
-      this.fieldsByOrder.length,
-      this.rowsByOrder.length,
- )) {
-      const field = this.fieldsByOrder[col - 1];
-      const rowData = this.rowsByOrder[row - 1];
-      out.push(this.readCellValue(rowData.id, field.id));
- }
- return out;
- }
-
- private resolveField(name: string): unknown {
- const rowId = this.rowStack[this.rowStack.length - 1];
- if (!rowId) throw new FormulaError("#ОШИБКА!");
- const field = this.fieldByName.get(name);
- if (!field) throw new FormulaError("#ИМЯ?", `Нет поля: ${name}`);
- return this.readCellValue(rowId, field.id);
- }
-
- private readCellValue(rowId: string, fieldId: string): unknown {
- const result = this.renderCell(rowId, fieldId);
- if (result.kind === "error") {
-      throw new FormulaError(result.code, result.message);
- }
- return normalizeValue(result.value);
- }
  +}
-

+/**

- - Если отрендеренный текст похож на число — возвращаем число,
- - иначе строку. Так `С1Р1 + С1Р2` работает как арифметика,
- - а `[Дата]` остаётся строкой для formatDate.
- */
  +const normalizeValue = (raw: string): unknown => {
- const trimmed = raw.trim().replace(",", ".");
- if (trimmed === "") return "";
- const n = Number(trimmed);
- if (!Number.isNaN(n) && Number.isFinite(n)) return n;
- return raw;
  +};
-

+/** Удобный хелпер: посчитать всю таблицу за один вызов. */
+export function renderTableCells(

- fields: Field[],
- rows: TableRowData[],
  +): RenderedCellMap {
- return new TableFormulaEngine(fields, rows).computeAll();
  +}
  MPC-END

MPC-PATH: src/tables/formula/compute-table.utils.ts
MPC-CONTENT
+import type { Field, TableRowData } from "../../types/table.types";
+import { TableFormulaEngine } from "./evaluator";
+import type { RenderedCellMap } from "./types"; +
+/**

- - Точка входа: считает формулы по всему снимку таблицы.
- -
- - Возвращает Map, где ключ — `${rowId}:${fieldId}`, значение — либо
- - отрендеренный текст, либо код ошибки (#ЦИКЛ! и т.п.). Компонент TableRow
- - читает уже готовое значение и не занимается вычислениями.
- */
  +export function computeTableFormulas(
- fields: Field[],
- rows: TableRowData[],
  +): RenderedCellMap {
- return new TableFormulaEngine(fields, rows).computeAll();
  +}
-

+export function pickRendered(

- map: RenderedCellMap | undefined,
- rowId: string,
- fieldId: string,
  +): string | undefined {
- return map?.get(`${rowId}:${fieldId}`);
  +}
  MPC-END

MPC-PATH: src/tables/formula/**tests**/formula.test.ts
MPC-CONTENT
+import type { Field, TableRowData } from "../../../types/table.types";
+import { computeTableFormulas } from "../compute-table.utils";
+import { extractCellRefs, parseCellRef, resolveCellRef } from "../references";
+import { preprocessExpression } from "../parser"; +
+const field = (id: string, name: string, order: number): Field =>

- ({
- id,
- tableId: "t1",
- name,
- type: "number",
- required: false,
- options: [],
- order,
- createdAt: "",
- updatedAt: "",
- }) as Field;
-

+const row = (

- id: string,
- order: number,
- cells: Record<string, string>,
  +): TableRowData =>
- ({
- id,
- tableId: "t1",
- order,
- cells,
- createdAt: "",
- updatedAt: "",
- }) as TableRowData;
-

+describe("parseCellRef", () => {

- it("разбирает кириллические и латинские ссылки", () => {
- expect(parseCellRef("С1Р1")).toEqual({
-      col: 1,
-      row: 1,
-      colFromEnd: false,
-      rowFromEnd: false,
- });
- expect(parseCellRef("C3P5")).toEqual({
-      col: 3,
-      row: 5,
-      colFromEnd: false,
-      rowFromEnd: false,
- });
- expect(parseCellRef("с2р4")).toEqual({
-      col: 2,
-      row: 4,
-      colFromEnd: false,
-      rowFromEnd: false,
- });
- });
-
- it("понимает отрицательные индексы", () => {
- expect(parseCellRef("С-1Р-1")).toEqual({
-      col: 1,
-      row: 1,
-      colFromEnd: true,
-      rowFromEnd: true,
- });
- expect(parseCellRef("С-2Р1")).toEqual({
-      col: 2,
-      row: 1,
-      colFromEnd: true,
-      rowFromEnd: false,
- });
- });
-
- it("возвращает null на мусоре", () => {
- expect(parseCellRef("A1")).toBeNull();
- expect(parseCellRef("С0Р1")).toBeNull();
- });
  +});
-

+describe("resolveCellRef", () => {

- it("считает от начала", () => {
- expect(
-      resolveCellRef(
-        { col: 1, row: 2, colFromEnd: false, rowFromEnd: false },
-        3,
-        5,
-      ),
- ).toEqual({ col: 1, row: 2 });
- });
-
- it("считает от конца", () => {
- expect(
-      resolveCellRef(
-        { col: 1, row: 1, colFromEnd: true, rowFromEnd: true },
-        3,
-        5,
-      ),
- ).toEqual({ col: 3, row: 5 });
- });
-
- it("возвращает null за пределами", () => {
- expect(
-      resolveCellRef(
-        { col: 5, row: 1, colFromEnd: false, rowFromEnd: false },
-        3,
-        3,
-      ),
- ).toBeNull();
- });
  +});
-

+describe("extractCellRefs", () => {

- it("находит ссылки и диапазоны", () => {
- const refs = extractCellRefs("сумма(С1Р1:С3Р5) + С1Р2");
- expect(refs).toContain("C1P1:C3P5");
- expect(refs).toContain("C1P2");
- });
-
- it("не трогает имена полей в скобках", () => {
- const refs = extractCellRefs("[Цена] * 2");
- expect(refs).toEqual([]);
- });
  +});
-

+describe("preprocessExpression", () => {

- it("заменяет поле на GET_FIELD", () => {
- expect(preprocessExpression("[Цена]")).toBe('GET_FIELD("Цена")');
- });
-
- it("заменяет ссылку на ячейку", () => {
- expect(preprocessExpression("С1Р1")).toBe('GET_CELL("C1P1")');
- });
-
- it("заменяет диапазон", () => {
- expect(preprocessExpression("С1Р1:С3Р5")).toBe(
-      'RANGE("C1P1","C3P5")',
- );
- });
-
- it("маппит русское имя функции", () => {
- expect(preprocessExpression("сумма(С1Р1:С1Р3)")).toBe(
-      'sum(RANGE("C1P1","C1P3"))',
- );
- });
-
- it("не портит строковые литералы", () => {
- expect(preprocessExpression('"С1Р1"')).toBe('"С1Р1"');
- });
  +});
-

+describe("computeTableFormulas", () => {

- const fields = [
- field("f1", "Цена", 0),
- field("f2", "Количество", 1),
- field("f3", "Итого", 2),
- ];
-
- it("арифметика по ссылкам на ячейки", () => {
- const rows = [
-      row("r1", 0, { f1: "10", f2: "5", f3: "{{ С1Р1 + С2Р1 * 2 }}" }),
- ];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r1:f3")).toBe("20");
- });
-
- it("сумма диапазона", () => {
- const rows = [
-      row("r1", 0, { f1: "1", f2: "2", f3: "" }),
-      row("r2", 1, { f1: "3", f2: "4", f3: "" }),
-      row("r3", 2, { f1: "", f2: "", f3: "{{ сумма(С1Р1:С2Р2) }}" }),
- ];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r3:f3")).toBe("10");
- });
-
- it("ссылка по имени поля", () => {
- const rows = [
-      row("r1", 0, { f1: "7", f2: "8", f3: "{{ [Цена] * [Количество] }}" }),
- ];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r1:f3")).toBe("56");
- });
-
- it("текст вокруг выражения сохраняется", () => {
- const rows = [
-      row("r1", 0, { f1: "10", f2: "5", f3: "Итого: {{ С1Р1 + С2Р1 }} руб." }),
- ];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r1:f3")).toBe("Итого: 15 руб.");
- });
-
- it("циклическая ссылка даёт #ЦИКЛ!", () => {
- const rows = [
-      row("r1", 0, { f1: "{{ С3Р1 }}", f2: "", f3: "{{ С1Р1 }}" }),
- ];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r1:f1")).toContain("#ЦИКЛ!");
- });
-
- it("деление на ноль даёт #ДЕЛ/0!", () => {
- const rows = [row("r1", 0, { f1: "0", f2: "{{ 1 / С1Р1 }}", f3: "" })];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r1:f2")).toContain("#ДЕЛ");
- });
-
- it("неизвестное поле даёт #ИМЯ?", () => {
- const rows = [row("r1", 0, { f1: "1", f2: "{{ [Нет такого] }}", f3: "" })];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r1:f2")).toBe("#ИМЯ?");
- });
-
- it("ссылка вне таблицы даёт #ССЫЛКА!", () => {
- const rows = [row("r1", 0, { f1: "{{ С99Р1 }}", f2: "", f3: "" })];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r1:f1")).toBe("#ССЫЛКА!");
- });
-
- it("ячейка без шаблона не меняется", () => {
- const rows = [row("r1", 0, { f1: "просто текст", f2: "", f3: "42" })];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r1:f1")).toBe("просто текст");
- expect(out.get("r1:f3")).toBe("42");
- });
-
- it("отрицательные индексы", () => {
- const rows = [
-      row("r1", 0, { f1: "1", f2: "2", f3: "3" }),
-      row("r2", 1, { f1: "4", f2: "5", f3: "{{ С-1Р-1 }}" }),
- ];
- const out = computeTableFormulas(fields, rows);
- expect(out.get("r2:f3")).toBe("5");
- });
  +});
  MPC-END

MPC-PATH: src/hooks/tables/use-table-with-formulas.hook.ts
MPC-CONTENT
+import { useMemo } from "react"; +
+import type { TableWithRecordRows } from "../../types";
+import { computeTableFormulas } from "../../tables/formula";
+import type { RenderedCellMap } from "../../tables/formula";
+import { useTable } from "./use-tables.hook"; +
+/**

- - Обёртка над useTable: возвращает таблицу и карту отрендеренных ячеек.
- -
- - Формулы пересчитываются только при изменении снимка таблицы — react-query
- - отдаёт новый объект при инвалидации `["table", tableId]`, useMemo
- - пересчитывает карту, компоненты получают свежие значения.
- */
  +export const useTableWithFormulas = (tableId: string) => {
- const query = useTable(tableId);
- const table = query.data as TableWithRecordRows | undefined;
-
- const renderedCells: RenderedCellMap | undefined = useMemo(() => {
- if (!table) return undefined;
- return computeTableFormulas(table.fields, table.rows);
- }, [table]);
-
- return { ...query, table, renderedCells };
  +};
  MPC-END

MPC-PATH: src/screens/formula-help.screen.tsx
MPC-CONTENT
+import { ScrollView, Text, View } from "react-native"; +
+import type { TranslationInput } from "../i18n";
+import { createStyles } from "../utils";
+import { useTheme } from "../contexts";
+import { useTranslate } from "../hooks"; +
+/**

- - Справка по формулам — аналог TemplateHelpScreen.
- - Показывает синтаксис ссылок, список функций и коды ошибок.
- */
-

+const FUNCTIONS: { sig: string; descKey: TranslationInput }[] = [

- { sig: "сумма(a, b, …)", descKey: "formulaHelp.functions.sum" },
- { sig: "среднее(a, b, …)", descKey: "formulaHelp.functions.avg" },
- { sig: "мин(a, b, …)", descKey: "formulaHelp.functions.min" },
- { sig: "макс(a, b, …)", descKey: "formulaHelp.functions.max" },
- { sig: "количество(a, b, …)", descKey: "formulaHelp.functions.count" },
- { sig: "счёт(a, b, …)", descKey: "formulaHelp.functions.counta" },
- { sig: "округл(x, digits?)", descKey: "formulaHelp.functions.round" },
- { sig: "abs(x)", descKey: "formulaHelp.functions.abs" },
- { sig: "если(cond, a, b)", descKey: "formulaHelp.functions.if" },
- { sig: "и(a, b, …)", descKey: "formulaHelp.functions.and" },
- { sig: "или(a, b, …)", descKey: "formulaHelp.functions.or" },
- { sig: "не(x)", descKey: "formulaHelp.functions.not" },
  +];
-

+const EXAMPLES = [

- "{{ С1Р1 + С1Р2 * 2 }}",
- "{{ сумма(С1Р1:С1Р10) }}",
- "{{ среднее(С2Р1:С2Р5) }}",
- "{{ [Цена] * [Количество] }}",
- "{{ если([Оплачено], 0, 1) }}",
- "Итого: {{ сумма(С1Р1:С1Р10) }} руб.",
- "{{ С-1Р1 }} — последний столбец",
- "{{ С-2Р-2:С-1Р-1 }} — правый нижний угол",
  +];
-

+const ERROR_ROWS: { code: string; key: TranslationInput }[] = [

- { code: "#ЦИКЛ!", key: "formulaHelp.errors.cycle" },
- { code: "#ДЕЛ/0!", key: "formulaHelp.errors.div" },
- { code: "#ИМЯ?", key: "formulaHelp.errors.name" },
- { code: "#ЗНАЧ!", key: "formulaHelp.errors.value" },
- { code: "#ССЫЛКА!", key: "formulaHelp.errors.ref" },
- { code: "#ОШИБКА!", key: "formulaHelp.errors.error" },
  +];
-

+export const FormulaHelpScreen = () => {

- const { colors } = useTheme();
- const { t } = useTranslate();
- const styles = getStyles(colors);
-
- return (
- <ScrollView style={styles.container} contentContainerStyle={styles.content}>
-      <Text style={styles.intro}>{t("formulaHelp.intro")}</Text>
-
-      <View style={styles.card}>
-        <Text style={styles.cardTitle}>{t("formulaHelp.syntaxTitle")}</Text>
-        <Text style={styles.body}>{t("formulaHelp.syntaxBody")}</Text>
-        <View style={styles.codeBlock}>
-          <Text style={styles.code}>
-            {"Итого: {{ сумма(С1Р1:С1Р10) }} руб."}
-          </Text>
-        </View>
-      </View>
-
-      <View style={styles.card}>
-        <Text style={styles.cardTitle}>
-          {t("formulaHelp.referencesTitle")}
-        </Text>
-        <Text style={styles.funcDesc}>{t("formulaHelp.references.cells")}</Text>
-        <Text style={styles.funcDesc}>{t("formulaHelp.references.range")}</Text>
-        <Text style={styles.funcDesc}>{t("formulaHelp.references.negative")}</Text>
-        <Text style={styles.funcDesc}>{t("formulaHelp.references.field")}</Text>
-      </View>
-
-      <View style={styles.card}>
-        <Text style={styles.cardTitle}>{t("formulaHelp.functionsTitle")}</Text>
-        {FUNCTIONS.map((fn) => (
-          <View key={fn.sig} style={styles.funcRow}>
-            <Text style={styles.code}>{fn.sig}</Text>
-            <Text style={styles.funcDesc}>{t(fn.descKey)}</Text>
-          </View>
-        ))}
-      </View>
-
-      <View style={styles.card}>
-        <Text style={styles.cardTitle}>{t("formulaHelp.examplesTitle")}</Text>
-        {EXAMPLES.map((ex) => (
-          <View key={ex} style={styles.exampleRow}>
-            <Text style={styles.code}>{ex}</Text>
-          </View>
-        ))}
-      </View>
-
-      <View style={styles.card}>
-        <Text style={styles.cardTitle}>{t("formulaHelp.errorsTitle")}</Text>
-        {ERROR_ROWS.map((row) => (
-          <View key={row.code} style={styles.funcRow}>
-            <Text style={styles.code}>{row.code}</Text>
-            <Text style={styles.funcDesc}>{t(row.key)}</Text>
-          </View>
-        ))}
-      </View>
- </ScrollView>
- );
  +};
-

+const getStyles = createStyles((colors) => ({

- container: { flex: 1, backgroundColor: colors.background },
- content: { padding: 16, paddingBottom: 32 },
- intro: {
- fontSize: 14,
- color: colors.textSecondary,
- lineHeight: 20,
- marginBottom: 16,
- },
- card: {
- backgroundColor: colors.card,
- borderRadius: 12,
- borderWidth: 1,
- borderColor: colors.cardBorder,
- padding: 16,
- marginBottom: 12,
- },
- cardTitle: {
- fontSize: 12,
- fontWeight: "600",
- color: colors.textMuted,
- textTransform: "uppercase",
- marginBottom: 10,
- letterSpacing: 0.5,
- },
- body: { fontSize: 14, color: colors.text, lineHeight: 20 },
- codeBlock: {
- marginTop: 10,
- backgroundColor: colors.inputBackground,
- paddingHorizontal: 10,
- paddingVertical: 6,
- borderRadius: 6,
- },
- code: {
- fontFamily: "monospace",
- fontSize: 13,
- color: colors.primary,
- },
- funcRow: { marginBottom: 12 },
- funcDesc: {
- fontSize: 13,
- color: colors.textSecondary,
- lineHeight: 18,
- marginTop: 4,
- },
- exampleRow: { marginBottom: 8 },
  +}));
-

+export default FormulaHelpScreen;
MPC-END

MPC-PATH: src/components/tables/table-row.component.tsx
MPC-CONTENT
@@ -1,2 +1,2 @@
import type { Field, TableRowData } from "../../types/table.types";
-import type { FormulaResult } from "../../tables/formula/types";
+import { hasTemplate, type RenderedCellMap } from "../../tables/formula/types";
@@ -14,4 +14,3 @@
export type TableRowProps = {
row: TableRowData;

- rowIndex: number;
  fields: Field[];
- formulaResults?: Map<string, FormulaResult>;

* renderedCells?: RenderedCellMap;
  onCellPress: (field: Field, row: TableRowData) => void;
  @@ -26,3 +25,2 @@
  export const TableRow = ({
  row,

- rowIndex,
  fields,
- formulaResults,

* renderedCells,
  onCellPress,
  @@ -41,32 +39,27 @@
  const renderValue = (field: Field) => {

- const renderFormulaContent = (result?: FormulaResult) => {
-      if (!result) {
-        return <Text style={styles.cellText}>…</Text>;
-      }
-      if (result.kind === "error") {
-        return (
-          <View style={styles.cellInner}>
-            <Text
-              style={[styles.cellText, styles.formulaError]}
-              numberOfLines={2}
-            >
-              {result.code}
-            </Text>
-            <MaterialIcons name="functions" size={14} color={colors.danger} />
-          </View>
-        );
-      }
-      return (
-        <View style={styles.cellInner}>
-          <Text style={styles.cellText} numberOfLines={2}>
-            {String(result.value)}
-          </Text>
-          <MaterialIcons name="functions" size={14} color={colors.primary} />
-        </View>
-      );
- };
- const raw = row.cells[field.id] ?? "";

- if (raw.startsWith("=")) {
-      const fieldIndex = fields.indexOf(field);
-      const result = formulaResults?.get(`${rowIndex}:${fieldIndex}`);
-      return renderFormulaContent(result);

* if (hasTemplate(raw)) {
*      const rendered = renderedCells?.get(`${row.id}:${field.id}`) ?? "…";
*      const isError = rendered.startsWith("#");
*      return (
*        <View style={styles.cellInner}>
*          <Text
*            style={[styles.cellText, isError && styles.formulaError]}
*            numberOfLines={2}
*          >
*            {rendered}
*          </Text>
*          <MaterialIcons
*            name="functions"
*            size={14}
*            color={isError ? colors.danger : colors.primary}
*          />
*        </View>
*      );
  }
  MPC-END

MPC-PATH: src/components/tables/cell/cell-editor.component.tsx
MPC-CONTENT
@@ -22,2 +22,3 @@
import type { NavigationProperty } from "../../../types";
+import { hasTemplate } from "../../../tables/formula/types";
@@ -51,2 +52,3 @@
const [value, setValue] = useState(initialValue);
const [tab, setTab] = useState<"edit" | "preview">("edit");

- const [selection, setSelection] = useState({ start: 0, end: 0 });
  @@ -270,2 +272,22 @@
  const isPending = updateCell.isPending;
  const isMultilinePreview = field.type === "multiline" && tab === "preview";
- const showFormulaUi =
- field.type === "text" ||
- field.type === "number" ||
- field.type === "multiline";
- const hasAnyTemplate = hasTemplate(value);
-
- /** Вставляет токен в позицию курсора в поле ввода. */
- const insertToken = (token: string) => {
- const before = value.slice(0, selection.start);
- const after = value.slice(selection.end);
- const cursor = selection.start + token.length;
- setValue(before + token + after);
- setSelection({ start: cursor, end: cursor });
- };
-
- const FORMULA_TOKENS = [
- "С1Р1",
- "С-1Р-1",
- "С1Р1:С3Р5",
- "[Цена]",
- "сумма",
- "среднее",
- "мин",
- "макс",
- "количество",
- "счёт",
- "округл",
- "если",
- ];
  @@ -298,9 +320,34 @@
  <Text style={styles.label}>
  {isMultilinePreview
  ? t("tables.cell.tabPreview")
  : t("tables.cell.value")}
  </Text>
-      {showFormulaUi && hasAnyTemplate && (
-        <View style={styles.tabs}>
-          <TouchableOpacity
-            style={[styles.tab, tab === "edit" && styles.tabActive]}
-            onPress={() => setTab("edit")}
-          >
-            <MaterialIcons name="edit" size={16} color={tab === "edit" ? colors.primary : colors.textMuted} />
-            <Text style={[styles.tabText, tab === "edit" && styles.tabTextActive]}>
-              {t("tables.cell.formulaTabEdit")}
-            </Text>
-          </TouchableOpacity>
-          <TouchableOpacity
-            style={[styles.tab, tab === "preview" && styles.tabActive]}
-            onPress={() => setTab("preview")}
-          >
-            <MaterialIcons name="functions" size={16} color={tab === "preview" ? colors.primary : colors.textMuted} />
-            <Text style={[styles.tabText, tab === "preview" && styles.tabTextActive]}>
-              {t("tables.cell.formulaTabPreview")}
-            </Text>
-          </TouchableOpacity>
-        </View>
-      )}
       {renderInput()}

-      {showFormulaUi && (
-        <ScrollView
-          horizontal
-          showsHorizontalScrollIndicator={false}
-          contentContainerStyle={styles.paletteContent}
-          keyboardShouldPersistTaps="handled"
-        >
-          {FORMULA_TOKENS.map((token) => (
-            <TouchableOpacity
-              key={token}
-              style={styles.paletteChip}
-              onPress={() => insertToken(`{{ ${token} }}`)}
-              activeOpacity={0.6}
-            >
-              <Text style={styles.paletteChipText}>{token}</Text>
-            </TouchableOpacity>
-          ))}
-        </ScrollView>
-      )}
-      {(field.type === "text" ||
         field.type === "number" ||
         field.type === "multiline") && (

@@ -505,2 +552,20 @@
formulaHintText: {
fontSize: 12,
color: colors.textMuted,
flexShrink: 1,
},

- paletteContent: {
- gap: 6,
- paddingRight: 16,
- paddingVertical: 8,
- },
- paletteChip: {
- paddingHorizontal: 10,
- paddingVertical: 4,
- borderRadius: 14,
- backgroundColor: colors.inputBackground,
- borderWidth: 1,
- borderColor: colors.inputBorder,
- },
- paletteChipText: {
- fontFamily: "monospace",
- fontSize: 12,
- color: colors.text,
- },
  }));
  MPC-END

MPC-PATH: src/screens/table-detail.screen.tsx
MPC-CONTENT
@@ -20,3 +20,4 @@
useTable,

- useTableWithFormulas,
  useCreateRow,
  @@ -50,2 +51,2 @@

* const { data, isLoading } = useTable(tableId);
* const table = data as TableWithRecordRows | undefined;

- const { table, renderedCells, isLoading } = useTableWithFormulas(tableId);
  @@ -198,14 +199,20 @@
  const handleRowMenu = (row: TableRowData) => {

* Alert.alert(t("tables.insertRow.menuTitle"), undefined, [

- Alert.alert(t("tables.insertRow.menuTitle"), undefined, [
  {
  text: t("tables.insertRow.above"),
  onPress: () => handleInsertRow(row.id, "above"),
  },
  {
  text: t("tables.insertRow.below"),
  onPress: () => handleInsertRow(row.id, "below"),
  },
-      {
-        text: t("tables.insertRow.duplicate"),
-        onPress: () => handleDuplicateRow(row),
-      },
       {
         text: t("common.delete"),

@@ -215,1 +222,26 @@
};

- /**
- - Дублирование строки: создаём пустую строку, копируем значения ячеек,
- - затем переупорядочиваем ids, чтобы дубликат шёл сразу за оригиналом.
- */
- const handleDuplicateRow = async (row: TableRowData) => {
- if (!table) return;
- try {
-      const created = await tablesService.createRow(tableId, {});
-      const newRowId = created.data.id;
-      for (const field of table.fields) {
-        const value = row.cells[field.id];
-        if (value) {
-          await tablesService.createOrUpdateCell({
-            rowId: newRowId,
-            fieldId: field.id,
-            value,
-          });
-        }
-      }
-      const refIndex = table.rows.findIndex((r) => r.id === row.id);
-      const ids = table.rows.map((r) => r.id);
-      ids.splice(refIndex + 1, 0, newRowId);
-      await tablesService.reorderRows({ tableId, ids });
-      queryClient.invalidateQueries({ queryKey: ["table", tableId] });
-      queryClient.invalidateQueries({ queryKey: ["tables"] });
- } catch {
-      Alert.alert(t("common.error"), t("tables.errors.duplicateRowFailed"));
- }
- };
-

@@ -324,4 +356,3 @@
row={row}
fields={table.fields}

-                    rowIndex={table.rows.indexOf(row)}

*                    renderedCells={renderedCells}
                     onCellPress={handleCellPress}

MPC-END

MPC-PATH: src/i18n/resources/ru.locale.json
MPC-CONTENT
@@ -96,5 +96,6 @@
"insertRow": {
"menuTitle": "Строка",
"above": "Вставить выше",

-      "below": "Вставить ниже"

*      "below": "Вставить ниже",
*      "duplicate": "Дублировать"
  }
  },
  @@ -653,3 +654,10 @@
  "syntaxTitle": "Синтаксис",

- "syntaxBody": "Формула начинается с =. Внутри можно использовать арифметику, ссылки на ячейки и функции.",

* "syntaxBody": "Выражение оборачивается в двойные фигурные скобки, как в шаблонах записей. Внутри — арифметика, ссылки на ячейки и функции. Ячейка может содержать текст и несколько выражений одновременно.",
* "references": {
*      "cells": "С1Р1 — столбец 1, ряд 1. Принимаются и кириллические, и латинские буквы, регистр не важен.",
*      "range": "С1Р1:С3Р5 — прямоугольник от ячейки до ячейки включительно.",
*      "negative": "С-1Р-1 — отсчёт с конца: последний столбец и последний ряд.",
*      "field": "[Название] — значение поля в этой же строке."
* },
  @@ -668,3 +676,7 @@
  "round": "Округление до N знаков после запятой.",
  "abs": "Модуль числа.",

-      "if": "Условный выбор: IF(условие, значение_если_истина, значение_если_ложь)."

*      "if": "Условный выбор: если(условие, значение_если_истина, значение_если_ложь).",
*      "and": "Логическое И: истина, если все аргументы истинны.",
*      "or": "Логическое ИЛИ: истина, если хотя бы один аргумент истинен.",
*      "not": "Логическое НЕ."

MPC-END

MPC-PATH: src/i18n/resources/en.locale.json
MPC-CONTENT
@@ -84,5 +84,6 @@
"insertRow": {
"menuTitle": "Row",
"above": "Insert above",

-      "below": "Insert below"

*      "below": "Insert below",
*      "duplicate": "Duplicate"
  },
  @@ -649,3 +649,10 @@
  "syntaxTitle": "Syntax",

- "syntaxBody": "A formula begins with =. You can use arithmetic, cell references and functions.",

* "syntaxBody": "Wrap an expression in double curly braces, just like in record templates. Inside — arithmetic, cell references and functions. A cell may contain plain text and several expressions at once.",
* "references": {
*      "cells": "C1P1 — column 1, row 1. Cyrillic and Latin letters are both accepted, case is ignored.",
*      "range": "C1P1:C3P5 — a rectangle from one cell to another, inclusive.",
*      "negative": "C-1P-1 — count from the end: last column, last row.",
*      "field": "[Name] — the field value in the same row."
* },
  @@ -664,3 +671,7 @@
  "round": "Round to N decimal places.",
  "abs": "Absolute value.",

-      "if": "Conditional: IF(condition, value_if_true, value_if_false)."

*      "if": "Conditional: if(condition, value_if_true, value_if_false).",
*      "and": "Logical AND: true if every argument is true.",
*      "or": "Logical OR: true if at least one argument is true.",
*      "not": "Logical NOT."

MPC-END
