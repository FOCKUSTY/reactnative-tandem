import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import Toast from "react-native-toast-message";

import type { AuthResponse } from "../types";
import { OFFLINE_CONFIG } from "../constants";
import { getApiUrl, subscribeApiUrl } from "../config/api-url";
import { authEvents, getDeviceMetadata, logger, tokenManager } from "../utils";
import type { AuthEventReason } from "../utils/auth-events.utils";

/**
 * Обновление токенов.
 *
 * Access-токен живёт час, поэтому 401 с `code: "INVALID_ACCESS_TOKEN"` — это не
 * «выйди из аккаунта», а «сходи за новой парой на `/auth/refresh`». Refresh-токен
 * при этом одноразовый: два параллельных обновления одним и тем же токеном
 * бэкенд считает переиспользованием и отзывает сессию целиком. Отсюда
 * single-flight ниже — на всё приложение одновременно живёт ровно один запрос
 * обновления, остальные ждут его результат.
 */

const REFRESH_MARGIN_MS = 60_000;

/** Код, которым сервер помечает именно протухший access-токен. */
const ACCESS_TOKEN_INVALID = "INVALID_ACCESS_TOKEN";

/** Эндпоинты, для которых 401 означает «неверные данные», а не «протух токен». */
const NO_REFRESH_ENDPOINTS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
]);

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
  /** Помечаем запрос, на котором интерцептор уже попробовал refresh. */
  _refreshAttempted?: boolean;
};

type TimeoutAwareError = AxiosError & { isTimeout?: boolean };

const api = axios.create({
  baseURL: getApiUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: OFFLINE_CONFIG.API_TIMEOUT,
});

// Пользователь может переключить сервер в настройках (в dev-режиме) —
// axios должен подхватить это без пересоздания инстанса.
subscribeApiUrl((url) => {
  api.defaults.baseURL = url;
});

/** Путь запроса без origin и query: `/auth/login`, `/auth/sessions/42` и т.п. */
const endpointOf = (url?: string): string => {
  if (!url) return "";
  const base = getApiUrl();
  const withoutOrigin =
    base && url.startsWith(base) ? url.slice(base.length) : url;
  return withoutOrigin.split("?")[0];
};

const isNoRefreshEndpoint = (url?: string): boolean =>
  NO_REFRESH_ENDPOINTS.has(endpointOf(url));

/** Код ошибки из тела ответа — по нему различаем «протух access» и всё прочее. */
const errorCodeOf = (error: AxiosError): string | undefined =>
  (error.response?.data as { code?: string } | undefined)?.code;

/**
 * Почему сервер не принял refresh-токен. `null` — это не отказ по токену
 * (сеть, 5xx), и разлогинивать в таком случае нельзя.
 */
const refreshFailureReason = (error: unknown): AuthEventReason | null => {
  if (!axios.isAxiosError(error)) return null;
  if (error.response?.status !== 401) return null;

  return errorCodeOf(error) === "REFRESH_TOKEN_REUSED"
    ? "refreshTokenReused"
    : "invalidRefreshToken";
};

let refreshPromise: Promise<string> | null = null;

/**
 * Обновление не удалось по вине токена: сессия мертва, событие `expired` уже
 * отправлено. Такую ошибку нельзя «замаскировать» повторным запросом со старым
 * access-токеном — иначе сервер ответит ещё одним 401 и пользователь получит
 * второй такой же тост.
 */
class SessionExpiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionExpiredError";
  }
}

/**
 * Меняет refresh-токен на новую пару и сохраняет её. Один вызов на всех
 * ожидающих: параллельные обращения получают тот же промис.
 */
const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const session = await tokenManager.getSession();
    const refreshToken = session?.refreshToken;
    if (!refreshToken) {
      authEvents.emit("expired", { reason: "noRefreshToken" });
      throw new SessionExpiredError("Нет сохранённого refresh-токена");
    }

    const metadata = await getDeviceMetadata();

    let response;
    try {
      response = await axios.post<AuthResponse>(
        `${getApiUrl()}/auth/refresh`,
        { refreshToken, ...metadata },
        {
          headers: { "Content-Type": "application/json" },
          timeout: OFFLINE_CONFIG.API_TIMEOUT,
        },
      );
    } catch (error) {
      const reason = refreshFailureReason(error);
      if (reason) {
        await tokenManager.clear();
        authEvents.emit("expired", { reason });
        throw new SessionExpiredError("Сервер отверг refresh-токен");
      }
      throw error;
    }

    const current = await tokenManager.getSession();
    if (!current) {
      throw new SessionExpiredError("Сессия завершилась во время обновления");
    }
    if (current.refreshToken !== refreshToken) {
      return current.accessToken;
    }

    const next = await tokenManager.persist(response.data);
    authEvents.emit("refreshed");
    return next.accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
};

api.interceptors.request.use(async (config) => {
  if (__DEV__) {
    void logger.debug("API Request", {
      url: config.url,
      method: config.method,
    });
  }

  if (isNoRefreshEndpoint(config.url)) return config;

  const session = await tokenManager.getSession();
  if (!session) return config;

  const timeLeft = tokenManager.accessTokenTimeLeft(session);
  if (timeLeft !== null && timeLeft < REFRESH_MARGIN_MS) {
    (config as RetriableRequestConfig)._refreshAttempted = true;
    try {
      const accessToken = await refreshAccessToken();
      config.headers.Authorization = `Bearer ${accessToken}`;
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  }

  config.headers.Authorization = `Bearer ${session.accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      void logger.debug("API Response", {
        url: response.config.url,
        status: response.status,
      });
    }

    return response;
  },
  async (error: AxiosError) => {
    const apiError = error as TimeoutAwareError;
    const config = error.config as RetriableRequestConfig | undefined;

    const code = errorCodeOf(error);
    const shouldRefresh =
      error.response?.status === 401 &&
      !!config &&
      !config._retry &&
      !config._refreshAttempted &&
      !isNoRefreshEndpoint(config.url) &&
      (code === undefined || code === ACCESS_TOKEN_INVALID);

    if (shouldRefresh && config) {
      const session = await tokenManager.getSession();
      if (session?.refreshToken) {
        config._retry = true;
        try {
          const accessToken = await refreshAccessToken();
          config.headers.Authorization = `Bearer ${accessToken}`;
          return await api.request(config);
        } catch {}
      } else if (config.headers?.Authorization) {
        authEvents.emit("expired", { reason: "noRefreshToken" });
      }
    }

    if (
      apiError.code === "ECONNABORTED" &&
      apiError.message.includes("timeout")
    ) {
      apiError.isTimeout = true;

      Toast.show({
        type: "error",
        text1: "Сервер недоступен",
        text2: "Проверьте подключение к интернету или попробуйте позже.",
        position: "bottom",
        visibilityTime: 4000,
      });
    }

    void logger.error("Axios Interceptor Error", {
      message: apiError.message,
      url: config?.url,
      method: config?.method,
      status: apiError.response?.status,
      response: apiError.response?.data,
      isTimeout: apiError.isTimeout,
    });

    return Promise.reject(error);
  },
);

export default api;
