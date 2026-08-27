import type { MeResponse } from "../../types";
import api from "../client";

export const usersService = {
  getMe: () => api.get<MeResponse>("/users/me"),
  linkPartner: (partnerUsername: string) =>
    api.post("/users/link", { partnerUsername }),
};
