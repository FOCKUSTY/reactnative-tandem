import * as Updates from "expo-updates";

import { logger } from "./logger.utils";
import { storage } from "./storage.utils";

/**
 * OTA-обновления через EAS Update.
 *
 * Тонкая обёртка над `expo-updates`: даёт безопасные (не падающие) операции,
 * единый лог и — главное — умеет ответить на вопрос «а приложение сейчас
 * обновилось?». Ответ строится на сравнении текущего `updateId` с тем, что
 * мы видели в прошлый запуск: `Updates.updateId` меняется ровно тогда, когда
 * на устройство применился новый OTA-бандл.
 *
 * В __DEV__ и при `Updates.isEnabled === false` функции молча возвращают
 * «ничего не произошло» — чтобы их можно было вызывать откуда угодно без
 * проверок.
 */

export type OtaCheckResult =
  | { status: "up-to-date" }
  | { status: "update-available" }
  | { status: "error"; message: string }
  | { status: "disabled" };

/** Куда сохраняем `updateId` предыдущего запуска, чтобы поймать факт апдейта. */
const PREV_UPDATE_ID_KEY = ".ota_prev_update_id";

export const isOtaUsable = (): boolean => !__DEV__ && Updates.isEnabled;

/** Снимок текущего бандла — то, что имеет смысл писать в лог. */
const currentBundleInfo = () => ({
  runtimeVersion: Updates.runtimeVersion ?? null,
  channel: Updates.channel ?? null,
  updateId: Updates.updateId ?? null,
  isEmbeddedLaunch: Updates.isEmbeddedLaunch,
  isEmergencyLaunch: Updates.isEmergencyLaunch,
  createdAt: Updates.createdAt ? Updates.createdAt.toISOString() : null,
});

/**
 * Логирует состояние бандла на старте и отдельно — факт применения апдейта.
 *
 * Логика:
 *  - прочитали прошлый `updateId` из хранилища;
 *  - если он есть и отличается от текущего — приложение реально обновилось
 *    между запусками, пишем это отдельной записью `OTA update applied`
 *    (её потом легко искать по логам и в экспортируемом файле);
 *  - если прошлого id не было, а сейчас есть (и launch не embedded) — это
 *    первый запуск после установки апдейта, тоже отдельная запись;
 *  - если бандл embedded (`updateId === null`), ничего не сохраняем.
 *
 * Вызывать один раз при бутстрапе приложения, до `checkAndFetchOnLaunch`.
 */
export const logLaunchInfo = async (): Promise<void> => {
  if (!isOtaUsable()) {
    await logger.info("OTA disabled, skip launch info", {
      isEnabled: Updates.isEnabled,
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      isDev: __DEV__,
    });
    return;
  }

  const info = currentBundleInfo();
  const source = info.isEmbeddedLaunch ? "embedded" : "ota";

  let previousUpdateId: string | null = null;
  try {
    previousUpdateId = await storage.getItem(PREV_UPDATE_ID_KEY);
  } catch (e) {
    void logger.warn("OTA: failed to read previous updateId", {
      error: e instanceof Error ? e.message : String(e),
    });
  }

  const changed =
    previousUpdateId !== null && previousUpdateId !== info.updateId;

  await logger.info("OTA launch info", {
    ...info,
    source,
    previousUpdateId,
    changed,
  });

  if (changed) {
    await logger.info("OTA update applied", {
      from: previousUpdateId,
      to: info.updateId,
      channel: info.channel,
      runtimeVersion: info.runtimeVersion,
      createdAt: info.createdAt,
    });
  } else if (previousUpdateId === null && !info.isEmbeddedLaunch) {
    await logger.info("OTA update installed (first launch after install)", {
      updateId: info.updateId,
      channel: info.channel,
    });
  }

  if (info.updateId) {
    try {
      await storage.setItem(PREV_UPDATE_ID_KEY, info.updateId);
    } catch (e) {
      void logger.warn("OTA: failed to persist current updateId", {
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }
};

type UpdatesContext = Updates.UpdatesNativeStateMachineContext;

/** Достаёт человекочитаемое сообщение из Error, не падая на не-Error. */
const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/**
 * Подписка на изменения стейт-машины `expo-updates`.
 *
 * В SDK 50+ `addListener` и `useUpdateEvents` удалены; вместо них —
 * `addUpdatesStateChangeListener`, который отдаёт снапшот контекста
 * стейт-машины. Вместо «событий» мы отслеживаем переходы булевых флагов,
 * а по `sequenceNumber` отсекаем снапшоты, в которых ничего значимого не
 * поменялось (иначе `checkError`/`downloadError`, живущие в контексте до
 * следующего цикла, залили бы лог повторами).
 *
 * Возвращает функцию отписки. В __DEV__ / при выключенном expo-updates —
 * no-op.
 */
export const subscribeToUpdateEvents = (): (() => void) => {
  if (!isOtaUsable()) return () => {};

  let prev: UpdatesContext | null = null;

  const subscription = Updates.addUpdatesStateChangeListener(({ context }) => {
    const was = prev;
    prev = context;

    if (was === null) {
      void logger.info("OTA: initial state", {
        sequenceNumber: context.sequenceNumber,
        isStartupProcedureRunning: context.isStartupProcedureRunning,
        isChecking: context.isChecking,
        isDownloading: context.isDownloading,
        isUpdateAvailable: context.isUpdateAvailable,
        isUpdatePending: context.isUpdatePending,
        isRestarting: context.isRestarting,
        restartCount: context.restartCount,
      });
      return;
    }

    if (context.sequenceNumber === was.sequenceNumber) return;

    if (!was.isStartupProcedureRunning && context.isStartupProcedureRunning) {
      void logger.info("OTA: startup procedure running");
    }

    if (!was.isChecking && context.isChecking) {
      void logger.info("OTA: checking for update");
    }

    if (
      was.isChecking &&
      !context.isChecking &&
      !context.isUpdateAvailable &&
      !context.checkError
    ) {
      void logger.info("OTA: check finished, no update available", {
        sequenceNumber: context.sequenceNumber,
      });
    }

    if (!was.isUpdateAvailable && context.isUpdateAvailable) {
      void logger.info("OTA: update available", {
        updateId: context.latestManifest?.id ?? null,
      });
    }

    if (!was.isDownloading && context.isDownloading) {
      void logger.info("OTA: download started");
    }

    if (context.isDownloading) {
      void logger.debug("OTA: download progress", {
        progress: Math.round(context.downloadProgress * 100),
      });
    }

    if (!was.isUpdatePending && context.isUpdatePending) {
      void logger.info("OTA: download complete, will apply on next launch", {
        updateId: context.downloadedManifest?.id ?? null,
      });
    }

    if (!was.isRestarting && context.isRestarting) {
      void logger.info("OTA: restarting to apply update", {
        restartCount: context.restartCount,
      });
    }

    if (!was.checkError && context.checkError) {
      void logger.error("OTA: check error", {
        message: errorMessage(context.checkError),
      });
    }

    if (!was.downloadError && context.downloadError) {
      void logger.error("OTA: download error", {
        message: errorMessage(context.downloadError),
      });
    }

    if (!was.rollback && context.rollback) {
      void logger.warn("OTA: rollback", {
        rollback: context.rollback,
      });
    }
  });

  return () => subscription.remove();
};

/** Проверяет, есть ли на сервере более свежий JS-бандл. */
export const checkForOtaUpdate = async (): Promise<OtaCheckResult> => {
  if (!isOtaUsable()) return { status: "disabled" };

  const startedAt = Date.now();
  try {
    const result = await Updates.checkForUpdateAsync();
    const durationMs = Date.now() - startedAt;
    const status = result.isAvailable ? "update-available" : "up-to-date";
    await logger.info("OTA check finished", { status, durationMs });
    return result.isAvailable
      ? { status: "update-available" }
      : { status: "up-to-date" };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await logger.warn("OTA check failed", {
      error: message,
      durationMs: Date.now() - startedAt,
    });
    return { status: "error", message };
  }
};

/**
 * Скачивает доступное обновление. Применение — автоматическое при следующем
 * холодном старте; принудительно перезапустить можно через `reloadToOtaUpdate`.
 */
export const fetchOtaUpdate = async (): Promise<boolean> => {
  if (!isOtaUsable()) return false;

  const startedAt = Date.now();
  try {
    await Updates.fetchUpdateAsync();
    await logger.info("OTA fetch finished", {
      durationMs: Date.now() - startedAt,
    });
    return true;
  } catch (error) {
    await logger.warn("OTA fetch failed", {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
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

  const startedAt = Date.now();
  try {
    const check = await Updates.checkForUpdateAsync();
    if (!check.isAvailable) {
      await logger.info("OTA reload skipped: no update available", {
        durationMs: Date.now() - startedAt,
      });
      return false;
    }

    await logger.info("OTA reload: update found, downloading");
    await Updates.fetchUpdateAsync();
    await logger.info("OTA reload: applying update and reloading");
    await Updates.reloadAsync();
    return true;
  } catch (error) {
    await logger.warn("OTA reload failed", {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
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

  const startedAt = Date.now();
  await logger.info("OTA: check on launch started", {
    runtimeVersion: Updates.runtimeVersion ?? null,
    channel: Updates.channel ?? null,
    updateId: Updates.updateId ?? null,
    isEmbeddedLaunch: Updates.isEmbeddedLaunch,
  });

  try {
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await logger.info("OTA: update available on launch, fetching", {
        latestUpdateId: Updates.latestContext.latestManifest?.id ?? null,
      });
      await Updates.fetchUpdateAsync();
      await logger.info("OTA update fetched, will apply on next launch", {
        durationMs: Date.now() - startedAt,
      });
    } else {
      // INFO, а не DEBUG: в проде нужно видеть, что проверка реально прошла
      // и апдейта нет, — иначе «нет апдейтов» не отличить от «проверка
      // не запускалась» и от «проверка упала на другом runtimeVersion».
      await logger.info("OTA: no update on launch", {
        durationMs: Date.now() - startedAt,
        runtimeVersion: Updates.runtimeVersion ?? null,
        channel: Updates.channel ?? null,
      });
    }
  } catch (error) {
    await logger.warn("OTA check on launch failed", {
      error: error instanceof Error ? error.message : String(error),
      durationMs: Date.now() - startedAt,
    });
  }
};

/**
 * Одна точка входа для бутстрапа: пишем launch-инфо (и, если что,
 * «applied»), подписываемся на события и запускаем проверку в фоне.
 * Возвращает функцию отписки — на уровне App её можно проигнорировать
 * (процесс живёт до конца работы приложения).
 */
export const initOta = async (): Promise<() => void> => {
  await logLaunchInfo();
  const unsubscribe = subscribeToUpdateEvents();
  void checkAndFetchOnLaunch();
  return unsubscribe;
};

/** Информация о текущей сборке/обновлении — для экрана логов и отладки. */
export const getOtaInfo = () => currentBundleInfo();
