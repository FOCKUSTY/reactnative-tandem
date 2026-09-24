import type { MeResponse } from "../../types";
import api from "../client";

export const usersService = {
  getMe: () => api.get<MeResponse>("/users/me"),
  linkPartner: (partnerUsername: string) =>
    api.post("/users/link", { partnerUsername }),
  updateMe: (data: { name?: string; username?: string }) =>
    api.patch<MeResponse>("/users/me", data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post("/users/me/password", data),
};
