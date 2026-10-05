import {
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
} from "date-fns";

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const date = new Date(value as string | number);
  return Number.isNaN(date.getTime()) ? null : date;
};

const difference = (
  a: unknown,
  b: unknown,
  fn: (left: Date, right: Date) => number,
): number => {
  const left = toDate(a);
  if (!left) return 0;
  const right = toDate(b) ?? new Date();
  return Math.abs(fn(left, right));
};

export const templateHelpers = {
  years: (a: unknown, b?: unknown) => difference(a, b, differenceInYears),
  days: (a: unknown, b?: unknown) => difference(a, b, differenceInDays),
  months: (a: unknown, b?: unknown) => difference(a, b, differenceInMonths),

  formatDate: (date: unknown, pattern?: unknown): string => {
    const parsed = toDate(date);
    if (!parsed) return "";
    const formatPattern =
      typeof pattern === "string" && pattern ? pattern : "dd.MM.yyyy";
    return format(parsed, formatPattern);
  },

  plural: (n: unknown, one: string, few: string, many: string): string => {
    const num = Number(n);
    if (!Number.isFinite(num)) {
      throw new Error(`plural: expected a number, got ${String(n)}`);
    }
    const value = Math.abs(Math.trunc(num));
    const mod10 = value % 10;
    const mod100 = value % 100;

    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  },
};
