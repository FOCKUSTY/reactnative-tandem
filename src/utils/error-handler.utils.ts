import type { ApiError } from "../types";
import { AxiosError } from "axios";
import { logger } from "./logger.utils";

export const handleApiError = (error: unknown): ApiError => {
  let apiError: ApiError;

  if (error instanceof AxiosError) {
    const isTimeout = (error as any).isTimeout || error.code === "ECONNABORTED";
    const message = isTimeout
      ? "Сервер не отвечает. Проверьте соединение или попробуйте позже."
      : error.response?.data?.message || error.message || "Ошибка сети";

    apiError = {
      message,
      status: error.response?.status,
      isTimeout,
    };

    logger.error("API Error", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      isTimeout,
    });
  } else if (error instanceof Error) {
    apiError = { message: error.message };
    logger.error("General Error", {
      message: error.message,
      stack: error.stack,
    });
  } else {
    apiError = { message: "Неизвестная ошибка" };
    logger.error("Unknown Error", { error });
  }

  return apiError;
};
