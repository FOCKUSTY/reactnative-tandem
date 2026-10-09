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
  PIN_FAILED_ATTEMPTS: ".pin_failed_attempts",
  PIN_LOCKED_UNTIL: ".pin_locked_until",
  CACHE_SETTINGS: ".cache_settings",
  PUSH_TOKEN: ".push_token",
  API_URL: ".api_url",
} as const;
