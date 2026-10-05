import type { TemplateIdentityMember } from "./types";

/**
 * Идентичность участников пары для шаблонов.
 *
 * `renderTemplate` вызывается и там, где нет доступа к React-контексту —
 * например, в `queryFn` react-query. Поэтому идентичность хранится в
 * модульной переменной: `AuthProvider` обновляет её, когда меняется `me`,
 * а `buildContext` читает её при рендере шаблона.
 *
 * Храним именно участников пары (а не «меня» и «партнёра»), потому что
 * перспектива шаблона привязана к автору записи, а не к зрителю: одну и ту же
 * запись оба партнёра должны видеть одинаково.
 */
export type TemplateIdentity = {
  /** Кто сейчас смотрит приложение (для фолбэка, если автор не найден). */
  currentUserId: string | null;
  /** Все участники пары: один или два. */
  members: TemplateIdentityMember[];
};

const EMPTY: TemplateIdentity = {
  currentUserId: null,
  members: [],
};

let identity: TemplateIdentity = EMPTY;

export const setTemplateIdentity = (next: TemplateIdentity): void => {
  identity = {
    currentUserId: next.currentUserId ?? null,
    members: next.members ?? [],
  };
};

export const getTemplateIdentity = (): TemplateIdentity => identity;

export const clearTemplateIdentity = (): void => {
  identity = EMPTY;
};
