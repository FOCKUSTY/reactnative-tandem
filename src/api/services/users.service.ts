import type {
  ChangePasswordResponse,
  DeviceMetadata,
  MeResponse,
} from "../../types";
import api from "../client";

export const usersService = {
  getMe: () => api.get<MeResponse>("/users/me"),
  linkPartner: (partnerUsername: string) =>
    api.post("/users/link", { partnerUsername }),
  updateMe: (data: { name?: string; username?: string; email?: string }) =>
    api.patch<MeResponse>("/users/me", data),

  /**
   * Полное удаление аккаунта. Требует пароль для подтверждения.
   * Успех — 200 с `{ message }`; при неверном пароле — 400.
   */
  deleteAccount: (data: { password: string } & DeviceMetadata) =>
    api.post<{ message: string }>("/users/me/delete", data),

  /**
   * Смена пароля отзывает все сессии и возвращает новую пару токенов для
   * текущего устройства — её обязательно нужно сохранить вместо старой.
   * `remember` бэкенд здесь игнорирует: новая сессия всегда на 90 дней.
   */
  changePassword: (
    data: { currentPassword: string; newPassword: string } & DeviceMetadata,
  ) => api.post<ChangePasswordResponse>("/users/me/password", data),
};
