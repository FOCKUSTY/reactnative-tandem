import { buildContext } from "./context";
import { evaluateExpression } from "./evaluate";
import type { TemplateRecord } from "./types";
import { logger } from "../utils";

const HAS_TEMPLATE_REGEX = /{{\s*(.+?)\s*}}/;

export const hasTemplate = (text?: string | null): boolean => {
  if (!text) return false;
  return HAS_TEMPLATE_REGEX.test(text);
};

export type TemplateRenderError = {
  expression: string;
  message: string;
};

export type TemplateRenderResult = {
  text: string;
  errors: TemplateRenderError[];
};

/**
 * Рендерит шаблон и попутно собирает ошибки вычисления.
 *
 * Нужно экрану создания записи: там показывается превью, и если пользователь
 * написал выражение с опечаткой, лучше подсветить это сразу, а не показывать
 * ему исходный `{{ ... }}` в превью как будто так и надо.
 */
export const renderTemplateWithDiagnostics = (
  text: string | null | undefined,
  record: TemplateRecord,
): TemplateRenderResult => {
  if (!text) return { text: "", errors: [] };

  const ctx = buildContext(record);
  const templateRegex = /{{\s*(.+?)\s*}}/g;
  const errors: TemplateRenderError[] = [];

  const rendered = text.replace(templateRegex, (match, expression: string) => {
    try {
      const result = evaluateExpression(expression, ctx);
      return result === null || result === undefined ? "" : String(result);
    } catch (error) {
      errors.push({
        expression,
        message: error instanceof Error ? error.message : String(error),
      });
      return match;
    }
  });

  return { text: rendered, errors };
};

/**
 * Тонкая обёртка без диагностики: возвращает только текст, ошибки пишет
 * в лог в `__DEV__`. Используется там, где результат нужен ради себя самого
 * (например, при загрузке записи с бэкенда).
 */
export const renderTemplate = (
  text: string | null | undefined,
  record: TemplateRecord,
): string => {
  const { text: rendered, errors } = renderTemplateWithDiagnostics(
    text,
    record,
  );

  if (__DEV__ && errors.length > 0) {
    for (const error of errors) {
      void logger.warn("Template render failed", error);
    }
  }

  return rendered;
};
