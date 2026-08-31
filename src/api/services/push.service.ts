import api from "../client";

export const pushService = {
  registerToken: (token: string) => api.post("/push/register", { token }),
  unregisterToken: (token: string) => api.post("/push/unregister", { token }),
  sendToPartner: (data: { message: string }) =>
    api.post("/push/send-to-partner", data),
};
