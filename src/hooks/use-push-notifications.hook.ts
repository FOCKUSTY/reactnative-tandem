import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as DeviceInfo from "expo-device";
import { Alert, Platform } from "react-native";

import { CONFIG, STORAGE_KEYS } from "../constants";
import { storage, getDeviceId, logger } from "../utils";
import { pushService } from "../api/services";
import { useAuth } from "../contexts";

export const registerForPushNotifications = async (userId: string) => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    let finalStatus = status;
    if (status !== "granted") {
      const req = await Notifications.requestPermissionsAsync();
      finalStatus = req.status;
    }
    if (finalStatus !== "granted") {
      await logger.warn("Push permission denied", { status: finalStatus });
      return { success: false, reason: "permission" as const };
    }

    const deviceId = await getDeviceId();
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: CONFIG.expo.extra.eas.projectId,
    });
    const pushToken = tokenData.data;

    await pushService.registerDevice({
      deviceId,
      pushToken,
      platform: Platform.OS,
      osVersion: DeviceInfo.osVersion || Platform.Version.toString(),
      model: DeviceInfo.modelName || "undefined",
      appVersion: CONFIG.expo.version,
    });

    await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, pushToken);
    await logger.info("Device registered for push", { deviceId, userId });
    return { success: true as const };
  } catch (error) {
    await logger.error("Push registration failed", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { success: false, reason: "error" as const };
  }
};

export const usePushNotifications = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!user || !isAuthenticated) return;

    let cancelled = false;

    (async () => {
      try {
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== "granted") {
          void logger.warn("Push notifications permission denied", {
            status: finalStatus,
          });
          return;
        }

        const deviceId = await getDeviceId();
        const storedToken = await storage.getItem(STORAGE_KEYS.PUSH_TOKEN);

        const shouldRegister = await (async () => {
          try {
            const response = await pushService.getDevice(deviceId);
            const { exists, belongsToCurrentUser } = response.data;
            return !exists || !belongsToCurrentUser;
          } catch (error) {
            void logger.warn("Device check failed", {
              error: error instanceof Error ? error.message : String(error),
            });
            return !storedToken;
          }
        })();

        if (!shouldRegister || cancelled) return;

        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: CONFIG.expo.extra.eas.projectId,
        });
        const pushToken = tokenData.data;

        await pushService.registerDevice({
          deviceId,
          pushToken,
          platform: Platform.OS,
          osVersion: DeviceInfo.osVersion || Platform.Version.toString(),
          model: DeviceInfo.modelName || "undefined",
          appVersion: CONFIG.expo.version,
        });

        await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, pushToken);

        void logger.info("Device registered for push", { deviceId });
      } catch (error) {
        void logger.error("Push registration failed", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    })();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data: any = response.notification.request.content.data;
        if (data?.type === "partner_message") {
          Alert.alert("Сообщение от партнёра", data?.body);
        }
      },
    );

    return () => {
      cancelled = true;
      subscription.remove();
    };
  }, [user?.id, isAuthenticated]); // 👈 зависим от id и наличия сессии — сработает и на login, и на register
};
