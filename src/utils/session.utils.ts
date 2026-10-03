import type { AuthResponse, AuthSession } from "../types";
import { STORAGE_KEYS } from "../constants";
import { storage } from "./storage.utils";

/**
 * Хранилище пары токенов.
 *
 * Access и refresh лежат одной JSON-записью: если писать их по отдельности,
 * обрыв между двумя записями оставит в SecureStore refresh-токен от одной пары
 * и access от другой — и первый же запрос уйдёт с мусорным заголовком.
 */

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readString = (value: unknown): string | null =>
  typeof value === "string" && value !== "" ? value : null;

/** Разбирает JSON из SecureStore; на мусоре возвращает null, а не падает. */
const parseSession = (raw: string | null): AuthSession | null => {
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;

    const accessToken = readString(parsed.accessToken);
    const refreshToken = readString(parsed.refreshToken);
    // Без обоих токенов сессия бесполезна: обновить её нечем.
    if (!accessToken || !refreshToken) return null;

    return {
      accessToken,
      refreshToken,
      accessTokenExpiresAt: readString(parsed.accessTokenExpiresAt),
      refreshTokenExpiresAt: readString(parsed.refreshTokenExpiresAt),
      sessionId: readString(parsed.sessionId),
    };
  } catch {
    return null;
  }
};

const toSession = (auth: AuthResponse): AuthSession => ({
  accessToken: auth.accessToken,
  refreshToken: auth.refreshToken,
  accessTokenExpiresAt: auth.accessTokenExpiresAt ?? null,
  refreshTokenExpiresAt: auth.refreshTokenExpiresAt ?? null,
  sessionId: auth.sessionId ?? null,
});

export const tokenManager = {
  getSession: async (): Promise<AuthSession | null> =>
    parseSession(await storage.getItem(STORAGE_KEYS.AUTH_SESSION)),

  getAccessToken: async (): Promise<string | null> => {
    const session = await tokenManager.getSession();
    return session?.accessToken ?? null;
  },

  getRefreshToken: async (): Promise<string | null> => {
    const session = await tokenManager.getSession();
    return session?.refreshToken ?? null;
  },

  /** Сохраняет ответ login / register / refresh и возвращает записанную сессию. */
  persist: async (auth: AuthResponse): Promise<AuthSession> => {
    const session = toSession(auth);
    await storage.setItem(STORAGE_KEYS.AUTH_SESSION, JSON.stringify(session));
    return session;
  },

  clear: async (): Promise<void> => {
    await storage.deleteItem(STORAGE_KEYS.AUTH_SESSION);
  },

  /**
   * Сколько миллисекунд осталось жить access-токену.
   * Отрицательное значение — уже истёк, null — срок неизвестен.
   */
  accessTokenTimeLeft: (session: AuthSession | null): number | null => {
    if (!session?.accessTokenExpiresAt) return null;
    const expiresAt = new Date(session.accessTokenExpiresAt).getTime();
    if (Number.isNaN(expiresAt)) return null;
    return expiresAt - Date.now();
  },

  /** Убирает ключ `.auth_token`, оставшийся от версий с одним токеном. */
  clearLegacyKeys: async (): Promise<void> => {
    await storage.deleteItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
