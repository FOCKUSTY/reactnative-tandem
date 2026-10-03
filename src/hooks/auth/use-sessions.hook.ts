import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";

import type { SessionInfo } from "../../types";
import { authService } from "../../api";
import { useAuth } from "../../contexts";
import { getDeviceId, handleApiError, logger } from "../../utils";
import { useTranslate } from "../i18n";

/**
 * Активные сессии пользователя (один вход с устройства = одна сессия).
 * Текущее устройство помечаем по sessionId, а по deviceId — на случай, если
 * sessionId в хранилище отсутствует (например, сессия создана до обновления).
 */
export const useSessions = () => {
  const { t } = useTranslate();
  const { sessionId: currentSessionId, logout } = useAuth();

  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await authService.getSessions();
      setSessions(response.data.sessions);
      setError(null);
    } catch (e) {
      setError(handleApiError(e).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getDeviceId()
      .then(setDeviceId)
      .catch(() => setDeviceId(null));
    void load();
  }, [load]);

  const isCurrent = useCallback(
    (session: SessionInfo) =>
      session.id === currentSessionId ||
      (!!deviceId && session.deviceId === deviceId),
    [currentSessionId, deviceId],
  );

  const revoke = useCallback(
    async (session: SessionInfo) => {
      try {
        await authService.revokeSession(session.id);
        if (isCurrent(session)) {
          // Отозвали свою же сессию — локально тоже выходим.
          await logout();
          return;
        }
        setSessions((prev) => prev.filter((item) => item.id !== session.id));
      } catch (e) {
        Alert.alert(t("common.error"), handleApiError(e).message);
      }
    },
    [isCurrent, logout, t],
  );

  const confirmRevoke = useCallback(
    (session: SessionInfo) => {
      Alert.alert(
        t("sessions.revokeConfirm.title"),
        t("sessions.revokeConfirm.message"),
        [
          { text: t("common.cancel"), style: "cancel" },
          {
            text: t("sessions.revoke"),
            style: "destructive",
            onPress: () => void revoke(session),
          },
        ],
      );
    },
    [revoke, t],
  );

  const confirmLogoutAll = useCallback(() => {
    Alert.alert(
      t("sessions.logoutAllConfirm.title"),
      t("sessions.logoutAllConfirm.message"),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("sessions.logoutAll"),
          style: "destructive",
          onPress: async () => {
            try {
              await authService.logoutAll();
            } catch (e) {
              // Отозвать все сессии могло и не получиться, но локально выходим
              // в любом случае: access-токен всё равно перестанет работать.
              void logger.warn("logoutAll failed", {
                error: e instanceof Error ? e.message : String(e),
              });
            }
            await logout();
          },
        },
      ],
    );
  }, [logout, t]);

  return {
    sessions,
    isLoading,
    error,
    reload: load,
    isCurrent,
    confirmRevoke,
    confirmLogoutAll,
  };
};
