import type { FormulaErrorCode } from "./types";

/**
 * Встроенные функции формул и вспомогательные преобразования.
 *
 * expr-eval передаёт массивы (результат RANGE) как отдельные аргументы, когда
 * функция объявлена с rest-параметрами — поэтому SUM/AVG/… умеют принимать
 * и одиночные значения, и диапазоны вперемешку.
 */

export class FormulaError extends Error {
  constructor(
    public code: FormulaErrorCode,
    message?: string,
  ) {
    super(message ?? code);
    this.name = "FormulaError";
  }
}

const isEmpty = (v: unknown): boolean =>
  v === null || v === undefined || v === "";

const flatten = (args: unknown[]): unknown[] => {
  const out: unknown[] = [];
  for (const a of args) {
    if (Array.isArray(a)) out.push(...flatten(a));
    else out.push(a);
  }
  return out;
};

/** Числовое ли значение — строка тоже принимается, если парсится. */
export function isNumeric(v: unknown): boolean {
  if (typeof v === "number") return Number.isFinite(v);
  if (typeof v === "boolean") return false;
  if (typeof v === "string") {
    const t = v.trim().replace(",", ".");
    return t !== "" && !Number.isNaN(Number(t));
  }
  return false;
}

export function toNumber(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "boolean") return v ? 1 : 0;
  if (typeof v === "string") {
    const t = v.trim().replace(",", ".");
    if (t === "") return 0;
    const n = Number(t);
    if (Number.isNaN(n)) {
      throw new FormulaError("#ЗНАЧ!", `Не число: ${v}`);
    }
    return n;
  }
  return 0;
}

/** Мягкое приведение: для агрегатов текст превращаем в 0 без исключения. */
const toNumberOrZero = (v: unknown): number => {
  try {
    return toNumber(v);
  } catch {
    return 0;
  }
};

const isTruthy = (v: unknown): boolean => {
  if (typeof v === "boolean") return v;
  if (typeof v === "number") return v !== 0;
  if (typeof v === "string") {
    const t = v.trim().toLowerCase();
    return t !== "" && t !== "0" && t !== "false";
  }
  return false;
};

export const formulaFunctions = {
  /** Сумма чисел. Пустые ячейки и текст — ноль. */
  sum: (...args: unknown[]): number =>
    flatten(args).reduce<number>((acc, v) => acc + toNumberOrZero(v), 0),

  /** Среднее арифметическое непустых значений. */
  avg: (...args: unknown[]): number => {
    const nums = flatten(args)
      .filter((v) => !isEmpty(v))
      .map(toNumberOrZero);
    if (nums.length === 0) return 0;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  },

  min: (...args: unknown[]): number => {
    const nums = flatten(args)
      .filter((v) => !isEmpty(v))
      .map(toNumberOrZero);
    return nums.length === 0 ? 0 : Math.min(...nums);
  },

  max: (...args: unknown[]): number => {
    const nums = flatten(args)
      .filter((v) => !isEmpty(v))
      .map(toNumberOrZero);
    return nums.length === 0 ? 0 : Math.max(...nums);
  },

  /** Сколько значений приводится к числу. */
  count: (...args: unknown[]): number => flatten(args).filter(isNumeric).length,

  /** Сколько непустых значений (числа, текст, булевы). */
  counta: (...args: unknown[]): number =>
    flatten(args).filter((v) => !isEmpty(v)).length,

  round: (value: unknown, digits: unknown = 0): number => {
    const n = toNumber(value);
    const d = Math.max(0, Math.min(15, Math.trunc(toNumber(digits))));
    const factor = Math.pow(10, d);
    return Math.round(n * factor) / factor;
  },

  abs: (value: unknown): number => Math.abs(toNumber(value)),

  if: (cond: unknown, a: unknown, b: unknown = ""): unknown =>
    isTruthy(cond) ? a : b,

  and: (...args: unknown[]): boolean => args.every(isTruthy),
  or: (...args: unknown[]): boolean => args.some(isTruthy),
  not: (v: unknown): boolean => !isTruthy(v),
};

export type FormulaFunctionName = keyof typeof formulaFunctions;
