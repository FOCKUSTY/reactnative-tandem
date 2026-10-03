import type { AuthResponse } from "../../types";
import api from "../client";

export const authService = {
  login: (username: string, password: string) =>
    api.post<AuthResponse>("/auth/login", { username, password }),

  register: (username: string, password: string, name: string, email: string) =>
    api.post<AuthResponse>("/auth/register", {
      username,
      password,
      name,
      email,
    }),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    }),
};
