import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import ru from "./resources/ru.locale.json";
import en from "./resources/en.locale.json";
import { storage } from "../utils";

const STORAGE_KEY = ".app_language";

export const resources = {
  ru: { translation: ru },
  en: { translation: en },
} as const;

export const SUPPORTED_LANGUAGES = Object.keys(resources);
export const SUPPORTED_LANGUAGES_AND_SYSTEM = [
  ...SUPPORTED_LANGUAGES,
  "system",
];

export type SupportedLanguage = keyof typeof resources;

export const defaultLanguage: SupportedLanguage = "ru";

export const getStoredLanguage = async (): Promise<SupportedLanguage> => {
  try {
    const deviceLanguage = Localization.getLocales()[0]?.languageCode;
    const language = await storage.getItem(STORAGE_KEY);
    if (!language || language === "system") {
      if (deviceLanguage && SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
        return deviceLanguage as SupportedLanguage;
      }
    }

    if (language && SUPPORTED_LANGUAGES.includes(language)) {
      return language as SupportedLanguage;
    }

    if (deviceLanguage && SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
      return deviceLanguage as SupportedLanguage;
    }

    return defaultLanguage;
  } catch {
    return defaultLanguage;
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export const initI18n = async () => {
  const language = await getStoredLanguage();
  await i18n.changeLanguage(language);
};

export const changeLanguage = async (
  language: SupportedLanguage | "system",
) => {
  if (language === "system") {
    const deviceLanguage = Localization.getLocales()[0]?.languageCode;
    if (deviceLanguage && SUPPORTED_LANGUAGES.includes(deviceLanguage)) {
      await storage.setItem(STORAGE_KEY, deviceLanguage);
      await i18n.changeLanguage(deviceLanguage as SupportedLanguage);

      return;
    }

    await storage.setItem(STORAGE_KEY, defaultLanguage);
    await i18n.changeLanguage(defaultLanguage);
    return;
  }

  await storage.setItem(STORAGE_KEY, language);
  await i18n.changeLanguage(language);
};

export * from "./types";

export { i18n };

export default i18n;
