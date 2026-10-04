import type { SupportedLanguage } from "../i18n";
import type { TranslationInput } from "../i18n";
import i18n from "i18next";

export type DateInput = Date | string | null | undefined;

export const DATES_LOCALES: Record<string, string> = {
  ru: "ru-RU",
  en: "en-US",
} satisfies Record<SupportedLanguage, string>;

/**
 * Разница между датой и сегодня в календарных днях.
 * > 0 — дата в будущем, < 0 — в прошлом, 0 — сегодня.
 * null — если дату не удалось распарсить.
 */
export const getDaysDiff = (value: DateInput): number | null => {
  const date = parseDate(value);
  if (!date) return null;
  const now = new Date();
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const a = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a.getTime() - b.getTime()) / MS_PER_DAY);
};

/**
 * Безопасно парсит входное значение в объект Date.
 * Возвращает null, если парсинг не удался.
 */
export const parseDate = (value: DateInput): Date | null => {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * Форматирует дату для отображения в UI (локализованная строка).
 * По умолчанию используется русская локаль 'ru-RU'.
 * Пример: "12 января 2025"
 */
export const formatDate = (
  value: DateInput,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = parseDate(value);
  if (!date) return "";
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  };
  return date.toLocaleDateString(
    locale ?? DATES_LOCALES[i18n.language],
    defaultOptions,
  );
};

/**
 * Форматирует дату и время для отображения в UI.
 * Пример: "12 января 2025, 14:30"
 */
export const formatDateTime = (
  value: DateInput,
  locale?: string,
  options?: Intl.DateTimeFormatOptions,
): string => {
  const date = parseDate(value);
  if (!date) return "";
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };
  return date.toLocaleString(
    locale ?? DATES_LOCALES[i18n.language],
    defaultOptions,
  );
};

/**
 * Форматирует только время.
 * Пример: "14:30"
 */
export const formatTime = (value: DateInput, locale?: string): string => {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleTimeString(locale ?? DATES_LOCALES[i18n.language], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Возвращает ISO-строку для логов и передачи на сервер.
 * Пример: "2025-01-12T14:30:00.000Z"
 */
export const formatIso = (value: DateInput): string => {
  const date = parseDate(value);
  if (!date) return "";
  return date.toISOString();
};

/**
 * Текущее время в ISO-формате (для логов).
 */
export const timestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Текущая дата в локализованном формате (для отображения).
 */
export const nowDate = (locale?: string): string => {
  return formatDate(new Date(), locale);
};

const KNOWN_INTERVALS = new Set([
  "1h",
  "6h",
  "12h",
  "1d",
  "2d",
  "7d",
  "1m",
  "1y",
  "5y",
  "10y",
  "100y",
]);

/**
 * Возвращает ключ локализации для интервала повторения.
 * Если интервал не из списка — возвращает сам интервал как есть
 * (i18next вернёт его без изменений, если ключа нет).
 */
export const formatIntervalLabel = (interval: string): TranslationInput => {
  if (!KNOWN_INTERVALS.has(interval)) return interval as TranslationInput;
  return `recurring.interval.${interval}` as TranslationInput;
};
