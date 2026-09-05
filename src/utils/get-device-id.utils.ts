import { Platform } from "react-native";
import * as Application from "expo-application";
import * as Keychain from "react-native-keychain";
import uuid from "react-native-uuid";
import { CONFIG } from "../constants";

export const getDeviceId = async () => {
  if (Platform.OS === "android") {
    return Application.getAndroidId();
  }

  if (Platform.OS === "ios") {
    return Application.getIosIdForVendorAsync() as Promise<string>;
  }

  const service = CONFIG.expo.android.package;
  const credentials = await Keychain.getGenericPassword({ service });
  if (credentials) {
    return credentials.password;
  }

  const id = uuid.v4();
  await Keychain.setGenericPassword("device_id", id, { service });
  return id;
};
