export interface User {
  id: string;
  username: string;
  name: string;
  email?: string | null;
}

/** Насколько «запомнить устройство»: число дней либо бессрочная сессия. */
export type RememberChoice = number | "forever";

/** Метаданные устройства для тела login / register / refresh / смены пароля. */
export interface DeviceMetadata {
  deviceId?: string;
  deviceName?: string;
  platform?: string;
  appVersion?: string;
}

/**
 * Ответ login / register / refresh: пара токенов одной сессии.
 * Поля `token` больше нет — access-токен передаётся заголовком
 * `Authorization: Bearer <accessToken>`.
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  /** null — бессрочная сессия («запомнить навсегда»). */
  refreshTokenExpiresAt: string | null;
  sessionId: string;
  user: User;
}

/** То, что лежит в SecureStore: пара токенов и сроки их жизни. */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  sessionId: string | null;
}

/** Смена пароля возвращает новую пару токенов для текущего устройства. */
export interface ChangePasswordResponse extends AuthResponse {
  success: boolean;
}

/** Одна активная сессия (один вход с устройства). */
export interface SessionInfo {
  id: string;
  deviceId: string | null;
  deviceName: string | null;
  platform: string | null;
  appVersion: string | null;
  userAgent: string | null;
  ip: string | null;
  /** null — бессрочная сессия. */
  expiresAt: string | null;
  lastUsedAt: string;
  createdAt: string;
}

export interface SessionsResponse {
  sessions: SessionInfo[];
}

export interface PairUser {
  id: string;
  username: string;
  name: string;
}

export interface MeResponse extends User {
  pairId: string | null;
  pair?: {
    userA: PairUser;
    userB: PairUser;
  };
  partner?: PairUser;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}
