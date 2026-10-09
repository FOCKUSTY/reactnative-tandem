import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

import { STORAGE_KEYS } from "../constants/storage-keys.constants";

/** Порт, на котором локально слушает бэкенд. */
export const DEV_API_PORT = 8080;

/**
 * Разрешённые прод-серверы. В проде пользователь может переключаться
 * только между ними, произвольный URL вводить нельзя.
 *
 * Порядок важен: первый элемент — дефолт, если в хранилище пусто
 * или записано что-то, чего нет в списке.
 */
export const PRODUCTION_API_URLS = [
  "https://backend-tandem-w6vf.onrender.com/api",
  "https://backend-tandem.onrender.com/api",
] as const;

const PRODUCTION_SET: ReadonlySet<string> = new Set(PRODUCTION_API_URLS);

/**
 * Локальные фоллбэки для __DEV__, если не удалось определить IP dev-сервера.
 * Первый — самый вероятный.
 */
export const DEV_FALLBACK_HOSTS = [
  "192.168.0.103",
  "192.168.0.102",
  "192.168.0.101",
] as const;

export type ApiUrlPresetKey =
  | "apiUrl.preset.production"
  | "apiUrl.preset.devServer"
  | "apiUrl.preset.local";

export interface ApiUrlPreset {
  url: string;
  titleKey: ApiUrlPresetKey;
  /** Для production-пресета — номер сервера (1-based), если их больше одного. */
  titleArgs?: Record<string, string | number>;
}

type Listener = (url: string) => void;
const listeners = new Set<Listener>();

let currentUrl: string = PRODUCTION_API_URLS[0];

export const getApiUrl = (): string => currentUrl;

export const setApiUrl = (url: string): void => {
  if (currentUrl === url) return;
  currentUrl = url;
  for (const listener of [...listeners]) {
    try {
      listener(url);
    } catch {}
  }
};

export const subscribeApiUrl = (listener: Listener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

/**
 * IP компьютера, на котором запущен `npm run start` (Metro/Expo).
 *
 * Expo отдаёт его в `Constants.expoConfig.hostUri` вида "192.168.0.42:8081".
 * На этом же компьютере обычно поднят и локальный бэкенд, поэтому адрес
 * логично предложить как один из вариантов API URL.
 */
export const getDevServerHost = (): string | null => {
  const constants = Constants as unknown as {
    expoConfig?: { hostUri?: string };
    manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } };
    manifest?: { debuggerHost?: string };
  };

  const hostUri =
    constants.expoConfig?.hostUri ??
    constants.manifest2?.extra?.expoGo?.debuggerHost ??
    constants.manifest?.debuggerHost;

  if (!hostUri || typeof hostUri !== "string") return null;
  const host = hostUri.split(":")[0];
  return host || null;
};

/** "192.168.0.5" → "http://192.168.0.5:8080/api"; готовый URL не трогаем. */
export const buildApiUrl = (host: string): string => {
  if (/^https?:\/\//i.test(host)) return host;
  return `http://${host}:${DEV_API_PORT}/api`;
};

/** URL по умолчанию: в dev — dev-сервер (или первый фоллбэк), в prod — первый прод. */
export const getDefaultApiUrl = (): string => {
  if (!__DEV__) return PRODUCTION_API_URLS[0];
  const devHost = getDevServerHost();
  if (devHost) return buildApiUrl(devHost);
  return buildApiUrl(DEV_FALLBACK_HOSTS[0]);
};

/**
 * Список предлагаемых URL для UI настроек.
 *
 * - В проде: только `PRODUCTION_API_URLS`.
 * - В __DEV__: прод + dev-сервер (из hostUri) + локальные фоллбэки.
 */
export const getApiUrlPresets = (): ApiUrlPreset[] => {
  const presets: ApiUrlPreset[] = PRODUCTION_API_URLS.map((url, index) => ({
    url,
    titleKey: "apiUrl.preset.production",
    titleArgs:
      PRODUCTION_API_URLS.length > 1 ? { index: index + 1 } : undefined,
  }));

  if (!__DEV__) return presets;

  const seen = new Set<string>(presets.map((p) => p.url));

  const devHost = getDevServerHost();
  if (devHost) {
    const url = buildApiUrl(devHost);
    if (!seen.has(url)) {
      seen.add(url);
      presets.push({
        url,
        titleKey: "apiUrl.preset.devServer",
        titleArgs: { host: devHost },
      });
    }
  }

  for (const host of DEV_FALLBACK_HOSTS) {
    const url = buildApiUrl(host);
    if (seen.has(url)) continue;
    seen.add(url);
    presets.push({
      url,
      titleKey: "apiUrl.preset.local",
      titleArgs: { host },
    });
  }

  return presets;
};

/** Разрешён ли произвольный URL (только в __DEV__). */
export const isCustomApiUrlAllowed = (): boolean => __DEV__;

/** Является ли URL одним из разрешённых прод-серверов. */
export const isKnownProductionUrl = (url: string): boolean =>
  PRODUCTION_SET.has(url);

/**
 * Читает сохранённый URL.
 *
 * В проде сохранённое значение принимается только если оно из
 * `PRODUCTION_API_URLS` — так пользователь не сможет застрять на
 * кастомном хосте после отката из dev-сборки.
 */
export const loadApiUrl = async (): Promise<string> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEYS.API_URL);
    if (stored && stored.trim()) {
      const value = stored.trim();
      if (__DEV__) return value;
      if (isKnownProductionUrl(value)) return value;
    }
  } catch {}
  return getDefaultApiUrl();
};

/**
 * Сохраняет URL. В проде разрешены только известные прод-серверы,
 * произвольные значения молча игнорируются.
 */
export const saveApiUrl = async (url: string): Promise<void> => {
  if (!__DEV__ && !isKnownProductionUrl(url)) return;
  await AsyncStorage.setItem(STORAGE_KEYS.API_URL, url);
};
