/**
 * Препроцессор выражений формул.
 *
 * Пользователь пишет выражения как в шаблонах записей — внутри `{{ ... }}`.
 * Здесь выражение приводится к синтаксису expr-eval:
 *   [Имя поля]   → GET_FIELD("Имя поля")
 *   С1Р1         → GET_CELL("C1P1")
 *   С1Р1:С3Р5    → RANGE("C1P1","C3P5")
 *   сумма(...)   → sum(...)
 *
 * expr-eval не понимает кириллицу в именах функций, поэтому русские
 * названия маппим на канонические английские. Английские идентификаторы
 * приводим к нижнему регистру — так они совпадают с ключами
 * `formulaFunctions` (`sum`, `avg`, `if`, …).
 *
 * Внутренние функции (`GET_CELL`, `RANGE`, `GET_FIELD`) вставляем ПОСЛЕ
 * перевода имён функций, чтобы не лоуэркейсить их самих. И прячем
 * найденные диапазоны в плейсхолдеры, иначе одиночные ссылки «залезут»
 * внутрь строковых аргументов `RANGE("C1P1","C3P5")` и сломают выражение.
 */

import { normalizeRefString } from "./references";

/** Русские имена функций и их синонимы → канонический expr-eval-идентификатор. */
const FUNCTION_ALIASES: Record<string, string> = {
  сумма: "sum",
  summa: "sum",
  среднее: "avg",
  average: "avg",
  mean: "avg",
  мин: "min",
  макс: "max",
  количество: "count",
  счёт: "counta",
  счет: "counta",
  округл: "round",
  округ: "round",
  абс: "abs",
  если: "if",
  и: "and",
  или: "or",
  не: "not",
};

/**
 * Заменяет узнанные имена функций (за которыми идёт открывающая скобка)
 * на канонические. Английские идентификаторы-вызовы опускаем в нижний
 * регистр. Строковые литералы не трогаем.
 */
function translateFunctionNames(expr: string): string {
  const out: string[] = [];
  let i = 0;
  while (i < expr.length) {
    const ch = expr[i];
    if (ch === '"') {
      let j = i + 1;
      while (j < expr.length) {
        if (expr[j] === "\\") j += 2;
        else if (expr[j] === '"') {
          j++;
          break;
        } else j++;
      }
      out.push(expr.slice(i, j));
      i = j;
      continue;
    }
    if (/[A-Za-zА-Яа-яЁё_]/.test(ch)) {
      let j = i;
      while (j < expr.length && /[A-Za-zА-Яа-яЁё0-9_]/.test(expr[j])) j++;
      const ident = expr.slice(i, j);
      let k = j;
      while (k < expr.length && /\s/.test(expr[k])) k++;
      const isCall = expr[k] === "(";
      const lower = ident.toLowerCase();
      if (isCall && FUNCTION_ALIASES[lower]) {
        out.push(FUNCTION_ALIASES[lower]);
      } else if (isCall) {
        out.push(lower);
      } else {
        out.push(ident);
      }
      i = j;
      continue;
    }
    out.push(ch);
    i++;
  }
  return out.join("");
}

/** Плейсхолдеры. `\u0000` в реальном тексте выражений не встречается. */
const FIELD_PLACEHOLDER = (i: number) => `\u0000F${i}\u0000`;
const RANGE_PLACEHOLDER = (i: number) => `\u0000R${i}\u0000`;

/**
 * Приводит пользовательское выражение к форме, понятной expr-eval.
 *
 * Порядок операций принципиален:
 *   1. Прячем `[Имя поля]` в плейсхолдеры, чтобы их не задели следующие regex.
 *   2. Переводим имена функций (только оригинальные идентификаторы, без GET_*).
 *   3. Нормализуем кириллические С/Р в C/P.
 *   4. Прячем найденные диапазоны в плейсхолдеры — их содержимое (C1P1 и C3P5
 *      в строковых аргументах) не должно попасть под следующий проход.
 *   5. Заменяем одиночные ссылки на GET_CELL(...).
 *   6. Возвращаем диапазоны и имена полей обратно.
 */
export function preprocessExpression(expr: string): string {
  const fields: string[] = [];
  const ranges: string[] = [];

  // 1. [Имя поля] -> \u0000F0\u0000
  let s = expr.replace(/\[([^\]]*)\]/g, (_, name: string) => {
    const idx = fields.length;
    fields.push(name);
    return FIELD_PLACEHOLDER(idx);
  });

  // 2. Русские имена функций -> английские (и лоуэркейс для английских).
  s = translateFunctionNames(s);

  // 3. С/Р -> C/P.
  s = normalizeRefString(s);

  // 4. Диапазоны -> \u0000R0\u0000. Сохраняем финальный RANGE(...) в массив,
  //    чтобы вернуть его обратно уже после замены одиночных ссылок.
  s = s.replace(
    /([Cc]-?\d+[Pp]-?\d+)\s*:\s*([Cc]-?\d+[Pp]-?\d+)/g,
    (_, a: string, b: string) => {
      const idx = ranges.length;
      ranges.push(
        `RANGE(${JSON.stringify(a.toUpperCase())},${JSON.stringify(b.toUpperCase())})`,
      );
      return RANGE_PLACEHOLDER(idx);
    },
  );

  // 5. Одиночные ссылки -> GET_CELL("C1P1").
  s = s.replace(
    /([Cc]-?\d+[Pp]-?\d+)/g,
    (_, a: string) => `GET_CELL(${JSON.stringify(a.toUpperCase())})`,
  );

  // 6. Возвращаем диапазоны.
  s = s.replace(/\u0000R(\d+)\u0000/g, (_, i: string) => {
    return ranges[parseInt(i, 10)] ?? "";
  });

  // 7. Возвращаем имена полей.
  s = s.replace(/\u0000F(\d+)\u0000/g, (_, i: string) => {
    const name = fields[parseInt(i, 10)] ?? "";
    return `GET_FIELD(${JSON.stringify(name)})`;
  });

  return s;
}

/** Имена полей, на которые ссылается выражение (для карты зависимостей). */
export function extractFieldNames(expr: string): string[] {
  const out: string[] = [];
  const re = /\[([^\]]*)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(expr)) !== null) out.push(m[1]);
  return out;
}

/** Регулярка для `{{ ... }}` — переиспользуется и в рендере, и в тестах. */
export const TEMPLATE_REGEX = /\{\{\s*([\s\S]*?)\s*\}\}/g;

/** Возвращает все выражения из текста ячейки (без разделителей и скобок). */
export function extractExpressions(text: string): string[] {
  const out: string[] = [];
  const re = new RegExp(TEMPLATE_REGEX.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(m[1]);
  return out;
}
