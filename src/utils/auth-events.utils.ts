import { logger } from "./logger.utils";

/**
 * События жизненного цикла сессии.
 *
 * Живут отдельно от React-контекста, потому что `api/client.ts` — не компонент:
 * если бы интерцептор импортировал контекст, получилась бы циклическая
 * зависимость (`context -> api -> context`). Контекст подписывается на события
 * и очищает состояние, а интерцептор только сообщает, что сессия умерла.
 */
export type AuthEvent = "expired" | "logout" | "refreshed";

/** Почему сессия признана мёртвой — от этого зависит текст для пользователя. */
export type AuthEventReason =
  "noRefreshToken" | "invalidRefreshToken" | "refreshTokenReused";

export interface AuthEventPayload {
  reason?: AuthEventReason;
}

export type AuthEventListener = (
  event: AuthEvent,
  payload: AuthEventPayload,
) => void;

const listeners = new Set<AuthEventListener>();

export const authEvents = {
  /** Возвращает функцию отписки — её удобно вернуть из `useEffect`. */
  subscribe: (listener: AuthEventListener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  emit: (event: AuthEvent, payload: AuthEventPayload = {}): void => {
    // Копия: слушатель может отписаться прямо во время рассылки.
    for (const listener of [...listeners]) {
      try {
        listener(event, payload);
      } catch (error) {
        void logger.warn("Auth event listener failed", {
          event,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  },
};
