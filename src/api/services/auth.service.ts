import type { AuthResponse } from "../../types";
import api from "../client";

export const authService = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { username, password }),

  register: (username: string, password: string, name: string) =>
    api.post<AuthResponse>("/auth/register", { username, password, name }),
};
