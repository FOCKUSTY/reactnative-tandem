import {
  differenceInDays,
  differenceInHours,
  differenceInMonths,
  differenceInWeeks,
  differenceInYears,
  format,
  type Locale,
} from "date-fns";
import { enUS, ru } from "date-fns/locale";

import i18n from "../i18n";

/**
 * date-fns не знает про i18next — приходится маппить языки вручную.
 * Без этой карты `{{ formatDate([date], "EEEE") }}` вернул бы английское
 * «Monday» даже когда интерфейс на русском.
 */
const DATE_FNS_LOCALES: Record<string, Locale> = {
  ru,
  en: enUS,
};

/** Локаль по текущему языку приложения; фолбэк — русская. */
const getDateFnsLocale = (): Locale => {
  const code = (i18n.language ?? "ru").slice(0, 2).toLowerCase();
  return DATE_FNS_LOCALES[code] ?? ru;
};

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
  months: (a: unknown, b?: unknown) => difference(a, b, differenceInMonths),
  weeks: (a: unknown, b?: unknown) => difference(a, b, differenceInWeeks),
  days: (a: unknown, b?: unknown) => difference(a, b, differenceInDays),
  hours: (a: unknown, b?: unknown) => difference(a, b, differenceInHours),

  /**
   * `age` — семантический синоним `years`: считается так же, но читается
   * естественнее в шаблонах вида «{{ age([date]) }} лет».
   */
  age: (a: unknown, b?: unknown) => difference(a, b, differenceInYears),

  formatDate: (date: unknown, pattern?: unknown): string => {
    const parsed = toDate(date);
    if (!parsed) return "";
    const formatPattern =
      typeof pattern === "string" && pattern ? pattern : "dd.MM.yyyy";
    return format(parsed, formatPattern, { locale: getDateFnsLocale() });
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

  /**
   * Склеивает массив в строку. Второй аргумент — разделитель, по умолчанию
   * «, ». Не-массивы приводим к строке как есть: так `{{ join([tags]) }}`
   * не падает, когда `[tags]` пустой.
   */
  join: (arr: unknown, sep?: unknown): string => {
    const separator = typeof sep === "string" ? sep : ", ";
    if (Array.isArray(arr)) {
      return arr
        .filter((item) => item !== null && item !== undefined)
        .map((item) => String(item))
        .join(separator);
    }
    return arr === null || arr === undefined ? "" : String(arr);
  },

  /** Длина массива; для не-массивов — 0. */
  count: (arr: unknown): number => (Array.isArray(arr) ? arr.length : 0),

  /** Первая буква заглавная, остальное — как было. */
  capitalize: (value: unknown): string => {
    const text = value === null || value === undefined ? "" : String(value);
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  },
};
