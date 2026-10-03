import type {
  AuthResponse,
  DeviceMetadata,
  RememberChoice,
  SessionsResponse,
} from "../../types";
import api from "../client";

/**
 * `/auth/refresh` и `/auth/logout` работают по самому refresh-токену в теле, а
 * не по заголовку: access-токен для них не нужен (и не должен передаваться).
 */
export const authService = {
  login: (
    username: string,
    password: string,
    remember?: RememberChoice,
    device?: DeviceMetadata,
  ) =>
    api.post<AuthResponse>("/auth/login", {
      username,
      password,
      remember,
      ...device,
    }),

  register: (
    username: string,
    password: string,
    name: string,
    email: string,
    remember?: RememberChoice,
    device?: DeviceMetadata,
  ) =>
    api.post<AuthResponse>("/auth/register", {
      username,
      password,
      name,
      email,
      remember,
      ...device,
    }),

  refresh: (refreshToken: string, device?: DeviceMetadata) =>
    api.post<AuthResponse>("/auth/refresh", { refreshToken, ...device }),

  logout: (refreshToken: string) =>
    api.post<{ message: string }>("/auth/logout", { refreshToken }),

  logoutAll: () => api.post<{ message: string }>("/auth/logout-all"),

  getSessions: () => api.get<SessionsResponse>("/auth/sessions"),

  revokeSession: (sessionId: string) =>
    api.delete<{ message: string }>(`/auth/sessions/${sessionId}`),

  /** `token` здесь — токен из письма, его не путать с refresh-токеном. */
  forgotPassword: (email: string) =>
    api.post<{ message: string }>("/auth/forgot-password", { email }),

  resetPassword: (token: string, newPassword: string) =>
    api.post<{ message: string }>("/auth/reset-password", {
      token,
      newPassword,
    }),
};
