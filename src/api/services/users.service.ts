import api from "../client";
import { User } from "../../types";

export interface MeResponse extends User {
  partnerId: string | null;
  partner: User | null;
}

export const usersService = {
  getMe: () => api.get<MeResponse>("/users/me"),
  linkPartner: (partnerUsername: string) =>
    api.post("/users/link", { partnerUsername }),
};
