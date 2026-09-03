import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { pushService } from "../api/services/push.service";
import { Alert } from "react-native";
import { useUser } from "./auth";
import { CONFIG, STORAGE_KEYS } from "../constants";
import { storage } from "../utils";

export const usePushNotifications = () => {
  const { user } = useUser();
  const tokenRef = useRef<string | null>(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data: any = response.notification.request.content.data;
        if (data?.type === "partner_message") {
          Alert.alert("Сообщение от партнёра", data?.body);
        }
      },
    );
    return () => subscription.remove();
  }, []);

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
        console.warn("Push notifications permission denied");
        return;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: CONFIG.expo.extra.eas.projectId,
      });
      const token = tokenData.data;
      tokenRef.current = token;

      const storedToken = await storage.getItem(STORAGE_KEYS.PUSH_TOKEN);
      if (storedToken === token) {
        return;
      }

      await pushService.registerToken(token);
      await storage.setItem(STORAGE_KEYS.PUSH_TOKEN, token);
    })();
  }, [user]);
};
