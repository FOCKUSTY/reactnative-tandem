/**
 * Разбор ссылок на ячейки в стиле «С1Р1».
 *
 * С — столбец, Р — ряд (строка). Принимаем и кириллические С/Р, и латинские
 * C/P в любом регистре — пользователь не должен думать о раскладке.
 * Индексы считаются с 1. Отрицательный индекс означает «отсчёт с конца»:
 * С-1 — последний столбец, С-2 — предпоследний и так далее. Диапазон
 * записывается через двоеточие: С1Р1:С3Р5 — прямоугольник.
 */

import type { CellRange, CellRef } from "./types";

/** С/с → C, Р/р → P. Так ссылки и функции приводятся к одной раскладке. */
export function normalizeRefString(s: string): string {
  return s.replace(/[Сс]/g, "C").replace(/[Рр]/g, "P");
}

/** Разбирает «С1Р1» / «c-1p-1». Возвращает null на мусоре. */
export function parseCellRef(raw: string): CellRef | null {
  const normalized = normalizeRefString(raw).trim();
  const m = normalized.match(/^C(-?\d+)P(-?\d+)$/i);
  if (!m) return null;
  const colRaw = parseInt(m[1], 10);
  const rowRaw = parseInt(m[2], 10);
  if (colRaw === 0 || rowRaw === 0) return null;
  return {
    col: Math.abs(colRaw),
    row: Math.abs(rowRaw),
    colFromEnd: colRaw < 0,
    rowFromEnd: rowRaw < 0,
  };
}

/**
 * Превращает абстрактную ссылку в конкретные (col, row) снимка.
 * Возвращает null, если ячейка выходит за пределы таблицы.
 */
export function resolveCellRef(
  ref: CellRef,
  fieldCount: number,
  rowCount: number,
): { col: number; row: number } | null {
  const col = ref.colFromEnd ? fieldCount - ref.col + 1 : ref.col;
  const row = ref.rowFromEnd ? rowCount - ref.row + 1 : ref.row;
  if (col < 1 || col > fieldCount || row < 1 || row > rowCount) return null;
  return { col, row };
}

/** Разбирает диапазон «С1Р1:С3Р5». Возвращает null на неверном формате. */
export function parseCellRange(raw: string): CellRange | null {
  const normalized = normalizeRefString(raw).trim();
  const m = normalized.match(/^(C-?\d+P-?\d+)\s*:\s*(C-?\d+P-?\d+)$/i);
  if (!m) return null;
  const from = parseCellRef(m[1]);
  const to = parseCellRef(m[2]);
  if (!from || !to) return null;
  return { from, to };
}

/** Итерирует все ячейки прямоугольного диапазона в порядке следования. */
export function* iterateRange(
  range: CellRange,
  fieldCount: number,
  rowCount: number,
): Generator<{ col: number; row: number }> {
  const a = resolveCellRef(range.from, fieldCount, rowCount);
  const b = resolveCellRef(range.to, fieldCount, rowCount);
  if (!a || !b) return;
  const c1 = Math.min(a.col, b.col);
  const c2 = Math.max(a.col, b.col);
  const r1 = Math.min(a.row, b.row);
  const r2 = Math.max(a.row, b.row);
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      yield { col: c, row: r };
    }
  }
}

export function rangeSize(range: CellRange): number {
  return (
    (Math.abs(range.from.row - range.to.row) + 1) *
    (Math.abs(range.from.col - range.to.col) + 1)
  );
}

/**
 * Извлекает из строки все ссылки на ячейки и диапазоны (для карты
 * зависимостей и для подсветки). Ссылки внутри `[ ... ]` игнорируются —
 * это имена полей, а не адреса ячеек.
 */
export function extractCellRefs(expr: string): string[] {
  // Уберём содержимое квадратных скобок, чтобы не спутать имя поля с адресом.
  const stripped = expr.replace(/\[[^\]]*\]/g, "");
  const normalized = normalizeRefString(stripped);
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const rangeRegex = /(C-?\d+P-?\d+)\s*:\s*(C-?\d+P-?\d+)/g;
  while ((m = rangeRegex.exec(normalized)) !== null) {
    out.push(`${m[1].toUpperCase()}:${m[2].toUpperCase()}`);
  }
  const cellRegex = /C-?\d+P-?\d+/g;
  while ((m = cellRegex.exec(normalized)) !== null) {
    out.push(m[0].toUpperCase());
  }
  return out;
}
