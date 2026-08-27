import type { ApiError } from "../types";
import { AxiosError } from "axios";

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof AxiosError) {
    return {
      message: error.response?.data?.message || error.message || "Ошибка сети",
      status: error.response?.status,
    };
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: "Неизвестная ошибка" };
};
