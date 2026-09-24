import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as DeviceInfo from "expo-device";
import { Alert, Platform } from "react-native";

import { CONFIG, STORAGE_KEYS } from "../constants";
import { storage, getDeviceId, logger } from "../utils";
import { pushService } from "../api/services";
import { useUser } from "./auth";

export const usePushNotifications = () => {
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;

    (async () => {
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

      if (!shouldRegister) {
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: CONFIG.expo.extra.eas.projectId,
      });
      const token = tokenData.data;

      await pushService.registerDevice({
        deviceId,
        pushToken: token,
        platform: Platform.OS,
        osVersion: DeviceInfo.osVersion || Platform.Version.toString(),
        model: DeviceInfo.modelName || "undefined",
        appVersion: CONFIG.expo.version,
      });

      await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    })();

    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data: any = response.notification.request.content.data;
        if (data?.type === "partner_message") {
          Alert.alert("Сообщение от партнёра", data?.body);
        }
      },
    );

    return () => subscription.remove();
  }, [user]);
};
