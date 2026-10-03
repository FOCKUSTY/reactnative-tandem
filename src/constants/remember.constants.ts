import type { TranslationInput } from "../i18n/types";
import type { RememberChoice } from "../types";

/**
 * Значения селектора «Запомнить устройство».
 *
 * Бэкенд принимает число дней или строку `"forever"` (бессрочная сессия);
 * невалидное значение он молча заменяет на 90 дней по умолчанию.
 */
export type RememberOption = "30" | "60" | "90" | "120" | "forever";

export const REMEMBER_OPTIONS: RememberOption[] = [
  "30",
  "60",
  "90",
  "120",
  "forever",
];

export const DEFAULT_REMEMBER_OPTION: RememberOption = "90";

export const REMEMBER_LABEL_KEYS: Record<RememberOption, TranslationInput> = {
  "30": "auth.remember.days30",
  "60": "auth.remember.days60",
  "90": "auth.remember.days90",
  "120": "auth.remember.days120",
  forever: "auth.remember.forever",
};

/** `"forever"` уходит строкой, остальные варианты — числом дней. */
export const toRememberChoice = (option: RememberOption): RememberChoice =>
  option === "forever" ? "forever" : Number(option);
