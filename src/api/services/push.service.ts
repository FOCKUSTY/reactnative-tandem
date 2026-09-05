import api from "../client";

export const pushService = {
  registerDevice: (data: {
    deviceId: string;
    pushToken: string;
    platform?: string;
    osVersion?: string;
    appVersion?: string;
    model?: string;
  }) => api.post("/push/register", data),

  unregisterDevice: (deviceId: string) =>
    api.post("/push/unregister", { deviceId }),

  getDevices: () => api.get("/push/devices"),

  getDevice: (deviceId: string) => api.get(`/push/device/${deviceId}`),

  sendToPartner: (message: string) =>
    api.post("/push/send-to-partner", { message }),
};
