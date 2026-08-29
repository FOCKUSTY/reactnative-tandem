type DateInput = Date | string | null | undefined;

/**
 * Безопасно парсит входное значение в объект Date.
 * Возвращает null, если парсинг не удался.
 */
export function parseDate(value: DateInput): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Форматирует дату для отображения в UI (локализованная строка).
 * По умолчанию используется русская локаль 'ru-RU'.
 * Пример: "12 января 2025"
 */
export function formatDate(
  value: DateInput,
  locale: string = "ru-RU",
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = parseDate(value);
  if (!date) return "";
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  };
  return date.toLocaleDateString(locale, defaultOptions);
}

/**
 * Форматирует дату и время для отображения в UI.
 * Пример: "12 января 2025, 14:30"
 */
export function formatDateTime(
  value: DateInput,
  locale: string = "ru-RU",
  options?: Intl.DateTimeFormatOptions,
): string {
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
  return date.toLocaleString(locale, defaultOptions);
}

/**
 * Форматирует только время.
 * Пример: "14:30"
 */
export function formatTime(value: DateInput, locale: string = "ru-RU"): string {
  const date = parseDate(value);
  if (!date) return "";
  return date.toLocaleTimeString(locale, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Возвращает ISO-строку для логов и передачи на сервер.
 * Пример: "2025-01-12T14:30:00.000Z"
 */
export function formatIso(value: DateInput): string {
  const date = parseDate(value);
  if (!date) return "";
  return date.toISOString();
}

/**
 * Текущее время в ISO-формате (для логов).
 */
export function timestamp(): string {
  return new Date().toISOString();
}

/**
 * Текущая дата в локализованном формате (для отображения).
 */
export function nowDate(locale: string = "ru-RU"): string {
  return formatDate(new Date(), locale);
}
