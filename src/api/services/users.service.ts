import api from "../client";
import { MeResponse } from "../../types";

export const usersService = {
  getMe: () => api.get<MeResponse>("/users/me"),
  linkPartner: (partnerUsername: string) =>
    api.post("/users/link", { partnerUsername }),
};
