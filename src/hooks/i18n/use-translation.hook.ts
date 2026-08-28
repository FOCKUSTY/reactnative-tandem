import type { TranslationInput } from "../../i18n";
import type { TOptionsBase } from "i18next";

import { useTranslation } from "react-i18next";

export type $Dictionary<T = unknown> = { [key: string]: T };

export const useTranslate = () => {
  const { t: it, i18n } = useTranslation();

  const t = (input: TranslationInput, options?: TOptionsBase & $Dictionary) => {
    return it(input, options);
  };

  return { t, it: it, i18n };
};
