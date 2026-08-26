import api from "../client";
import { AuthResponse } from "../../types";

export const authService = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { username, password }),
};
