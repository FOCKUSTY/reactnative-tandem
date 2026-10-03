import { Platform } from "react-native";
import * as DeviceInfo from "expo-device";

import type { DeviceMetadata } from "../types";
import { CONFIG } from "../constants";
import { getDeviceId } from "./get-device-id.utils";
import { logger } from "./logger.utils";

/**
 * Метаданные устройства для тела login / register / refresh / смены пароля.
 *
 * Бэкенд читает их только из тела запроса (заголовок `X-Device-Id` разрешён в
 * CORS, но в коде не читается), поэтому передаём их плоско. Без этих полей в
 * списке активных сессий все устройства выглядят как «неизвестные».
 *
 * `modelName` предпочитаем `deviceName`: на iOS 16+ имя устройства без
 * специального entitlement приходит обезличенным («iPhone») и не различает
 * устройства, а модель — всегда конкретна.
 */
export const getDeviceMetadata = async (): Promise<DeviceMetadata> => {
  try {
    return {
      deviceId: await getDeviceId(),
      deviceName: DeviceInfo.modelName || DeviceInfo.deviceName || undefined,
      platform: Platform.OS,
      appVersion: CONFIG.expo.version,
    };
  } catch (error) {
    // Метаданные — не повод не дать пользователю войти.
    void logger.warn("Failed to collect device metadata", {
      error: error instanceof Error ? error.message : String(error),
    });
    return {};
  }
};
