import * as Updates from "expo-updates";
import { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";

import { useTheme } from "../../contexts";
import { useTranslate } from "../../hooks";
import { createStyles, logger, isOtaUsable } from "../../utils";

/**
 * Реактивный слой поверх `useUpdates()`.
 *
 * Хук сам по себе отдаёт актуальное состояние стейт-машины, но нам нужны
 * ещё две вещи: (1) писать переходы в лог ровно один раз на изменение и
 * (2) показать пользователю баннер, когда апдейт скачан и ждёт рестарта.
 * Автоматический reloadAsync() здесь не вызываем: он может выбить
 * пользователя из формы. Решение о перезапуске — за ним.
 */
export const UpdatesObserver = () => {
  const { colors } = useTheme();
  const { t } = useTranslate();
  const styles = getStyles(colors);

  const {
    currentlyRunning,
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    downloadProgress,
    checkError,
    downloadError,
  } = Updates.useUpdates();

  const prevRef = useRef<{
    available: boolean;
    pending: boolean;
    checking: boolean;
    downloading: boolean;
    checkError: string | null;
    downloadError: string | null;
  } | null>(null);

  useEffect(() => {
    if (!isOtaUsable()) return;

    const prev = prevRef.current;
    const next = {
      available: isUpdateAvailable,
      pending: isUpdatePending,
      checking: isChecking,
      downloading: isDownloading,
      checkError: checkError?.message ?? null,
      downloadError: downloadError?.message ?? null,
    };

    if (prev === null) {
      void logger.info("OTA: observer initial state", {
        ...next,
        updateId: currentlyRunning.updateId ?? null,
        isEmbeddedLaunch: currentlyRunning.isEmbeddedLaunch,
      });
      prevRef.current = next;
      return;
    }

    if (!prev.checking && next.checking) {
      void logger.info("OTA: checking for update (observer)");
    }

    if (!prev.available && next.available) {
      void logger.info("OTA: update available (observer)", {
        updateId: Updates.latestContext.latestManifest?.id ?? null,
      });
    }

    if (!prev.downloading && next.downloading) {
      void logger.info("OTA: download started (observer)");
    }

    if (next.downloading) {
      void logger.debug("OTA: download progress (observer)", {
        progress: downloadProgress
          ? Math.round(downloadProgress * 100)
          : undefined,
      });
    }

    if (!prev.pending && next.pending) {
      void logger.info(
        "OTA: download complete, waiting for user restart (observer)",
        { updateId: Updates.latestContext.downloadedManifest?.id ?? null },
      );
    }

    if (!prev.checkError && next.checkError) {
      void logger.error("OTA: check error (observer)", {
        message: next.checkError,
      });
    }

    if (!prev.downloadError && next.downloadError) {
      void logger.error("OTA: download error (observer)", {
        message: next.downloadError,
      });
    }

    prevRef.current = next;
  }, [
    isUpdateAvailable,
    isUpdatePending,
    isChecking,
    isDownloading,
    downloadProgress,
    checkError,
    downloadError,
    currentlyRunning.updateId,
    currentlyRunning.isEmbeddedLaunch,
  ]);

  if (!isUpdatePending) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>{t("settings.updateReady")}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          void logger.info("OTA: user confirmed restart to apply update");
          void Updates.reloadAsync();
        }}
      >
        <Text style={styles.buttonText}>{t("settings.restartNow")}</Text>
      </TouchableOpacity>
    </View>
  );
};

const getStyles = createStyles((colors) => ({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.bannerBackground,
    borderBottomWidth: 1,
    borderBottomColor: colors.bannerBorder,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  text: {
    flex: 1,
    color: colors.bannerText,
    fontSize: 13,
    fontWeight: "500",
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
}));
