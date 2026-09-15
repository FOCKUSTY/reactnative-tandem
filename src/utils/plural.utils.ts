import type { TranslationInput } from "../i18n";

export type PluralForm = "one" | "few" | "many" | "other";

const SLAVIC = ["ru", "uk", "be"];

/**
 * Возвращает форму множественного числа для числа и языка.
 * Русский: one (1, 21), few (2–4, 22–24), many (0, 5–20, 25–30)
 * Английский и все прочие: one (1), other (всё остальное)
 */
export const getPluralForm = (count: number, lang: string): PluralForm => {
  const n = Math.abs(Math.trunc(count));
  const code = lang.slice(0, 2).toLowerCase();

  if (SLAVIC.includes(code)) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  }

  return n === 1 ? "one" : "other";
};

/**
 * Собирает ключ локализации с суффиксом формы.
 * Пример: pluralKey("home.daysLeft", 5, "ru") -> "home.daysLeft_many"
 */
export const pluralKey = (
  base: string,
  count: number,
  lang: string,
): TranslationInput => {
  return `${base}_${getPluralForm(count, lang)}` as TranslationInput;
};
