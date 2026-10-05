import { Parser } from "expr-eval";

import { templateHelpers } from "./helpers";
import type { TemplateContext } from "./types";

const parser = new Parser();
parser.functions = {
  ...parser.functions,
  ...templateHelpers,
};

const FIELD_REGEX = /\[([a-zA-Z0-9_.]+)\]/g;

export const evaluateExpression = (
  expression: string,
  ctx: TemplateContext,
): unknown => {
  const normalized = expression.replace(FIELD_REGEX, "$1");
  const parsed = parser.parse(normalized);
  return parsed.evaluate(ctx.vars as any);
};
