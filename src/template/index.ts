import { buildContext } from "./context";
import { evaluateExpression } from "./evaluate";
import type { TemplateRecord } from "./types";
import { logger } from "../utils";

const HAS_TEMPLATE_REGEX = /{{\s*(.+?)\s*}}/;

export const hasTemplate = (text?: string | null): boolean => {
  if (!text) return false;
  return HAS_TEMPLATE_REGEX.test(text);
};

export const renderTemplate = (
  text: string | null | undefined,
  record: TemplateRecord,
): string => {
  if (!text) return "";

  const ctx = buildContext(record);
  // Свой инстанс на вызов: с общим `g`-регексом `lastIndex` утекает между
  // вызовами, если его случайно начнут использовать в `.test()` или `.exec()`.
  const templateRegex = /{{\s*(.+?)\s*}}/g;

  return text.replace(templateRegex, (match, expression: string) => {
    try {
      const result = evaluateExpression(expression, ctx);
      return result === null || result === undefined ? "" : String(result);
    } catch (error) {
      if (__DEV__) {
        void logger.warn("Template render failed", {
          expression,
          error: error instanceof Error ? error.message : String(error),
        });
      }
      return match;
    }
  });
};

export * from "./types";
