export const STORAGE_KEYS = {
  /** Пара токенов одной JSON-записью: access + refresh и сроки их жизни. */
  AUTH_SESSION: ".auth_session",
  /** Legacy-ключ с единственным токеном: нужен только для очистки. */
  AUTH_TOKEN: ".auth_token",
  AUTH_USER: ".auth_user",
  AUTH_ME: ".auth_me",
  HIDE_PARTNER_BANNER: ".hide_partner_banner",
  LOGGING_ENABLED: ".logging_enabled",
  PIN_ENABLED: ".pin_enabled",
  PIN_CODE: ".pin_code",
  CACHE_SETTINGS: ".cache_settings",
  PUSH_TOKEN: ".push_token",
} as const;
