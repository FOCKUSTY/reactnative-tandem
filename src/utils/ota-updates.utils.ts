import * as Updates from "expo-updates";

import { logger } from "./logger.utils";

/**
 * OTA-обновления через EAS Update.
 *
 * Это тонкая обёртка над `expo-updates`: даёт безопасные (не падающие)
 * операции и единый лог. В __DEV__ и при `Updates.isEnabled === false`
 * функции молча возвращают "ничего не произошло" — чтобы их можно было
 * вызывать откуда угодно без проверок.
 */

export type OtaCheckResult =
  | { status: "up-to-date" }
  | { status: "update-available" }
  | { status: "error"; message: string }
  | { status: "disabled" };

const isOtaUsable = (): boolean => !__DEV__ && Updates.isEnabled;

/** Проверяет, есть ли на сервере более свежий JS-бандл. */
export const checkForOtaUpdate = async (): Promise<OtaCheckResult> => {
  if (!isOtaUsable()) return { status: "disabled" };

  try {
    const result = await Updates.checkForUpdateAsync();
    return result.isAvailable
      ? { status: "update-available" }
      : { status: "up-to-date" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    void logger.warn("OTA check failed", { error: message });
    return { status: "error", message };
  }
};

/**
 * Скачивает доступное обновление. Применение — автоматическое при следующем
 * холодном старте; принудительно перезапустить можно через `reloadToOtaUpdate`.
 */
export const fetchOtaUpdate = async (): Promise<boolean> => {
  if (!isOtaUsable()) return false;

  try {
    await Updates.fetchUpdateAsync();
    return true;
  } catch (error) {
    void logger.warn("OTA fetch failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};

/**
 * Проверяет наличие апдейта, скачивает и перезапускает приложение.
 * Удобно для кнопки «Проверить обновления» в настройках.
 * Возвращает `true`, если обновление было найдено и применено.
 */
export const reloadToOtaUpdate = async (): Promise<boolean> => {
  if (!isOtaUsable()) return false;

  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) return false;

    await Updates.fetchUpdateAsync();
    await Updates.reloadAsync();
    return true;
  } catch (error) {
    void logger.warn("OTA reload failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
};

/**
 * Проверка «на старте»: скачиваем апдейт в фоне, но не блокируем рендер.
 * Если сеть отвалилась или сервер недоступен — просто логируем и идём дальше.
 * В __DEV__ и при выключенном expo-updates функция ничего не делает.
 */
export const checkAndFetchOnLaunch = async (): Promise<void> => {
  if (!isOtaUsable()) return;

  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
      void logger.info("OTA update fetched, will apply on next launch");
    }
  } catch (error) {
    void logger.warn("OTA check on launch failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  }
};

/** Информация о текущей сборке/обновлении — для экрана логов и отладки. */
export const getOtaInfo = () => ({
  runtimeVersion: Updates.runtimeVersion,
  channel: Updates.channel,
  updateId: Updates.updateId,
  isEmbeddedLaunch: Updates.isEmbeddedLaunch,
  createdAt: Updates.createdAt,
  isEnabled: Updates.isEnabled,
});
