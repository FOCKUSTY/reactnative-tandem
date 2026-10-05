import type {
  TemplateContext,
  TemplateIdentityMember,
  TemplateRecord,
} from "./types";
import { getTemplateIdentity } from "./identity";

const safeDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const EMPTY_MEMBER: TemplateIdentityMember = {
  id: "",
  name: "",
  username: "",
};

/**
 * Разбирает участников пары на роли «автор» и «партнёр».
 *
 * Роль привязана к `record.userId`, а не к тому, кто смотрит: одну и ту же
 * запись оба партнёра должны видеть одинаково. Если автор записи не найден
 * среди участников пары (например, пара распалась или запись создана до
 * привязки) — считаем автором текущего пользователя, партнёра оставляем
 * пустым.
 */
const resolveRoles = (
  record: TemplateRecord,
): { author: TemplateIdentityMember; partner: TemplateIdentityMember } => {
  const { members, currentUserId } = getTemplateIdentity();

  const author =
    (record.userId && members.find((m) => m.id === record.userId)) ||
    members.find((m) => m.id === currentUserId) ||
    members[0];

  const partner = members.find((m) => m.id !== author?.id);

  return {
    author: author ?? EMPTY_MEMBER,
    partner: partner ?? EMPTY_MEMBER,
  };
};

export const buildContext = (record: TemplateRecord): TemplateContext => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = safeDate(record.dateEvent);
  const createdAt = safeDate(record.createdAt) ?? now;
  const updatedAt = safeDate(record.updatedAt) ?? now;
  const { author, partner } = resolveRoles(record);

  return {
    record,
    now,
    today,
    vars: {
      date,
      createdAt,
      updatedAt,
      title: record.title ?? "",
      content: record.content ?? "",
      tags: record.tags ?? [],
      section: record.section?.name ?? "",
      sectionSlug: record.section?.slug ?? "",
      isCompleted: record.isCompleted ?? false,
      isPinned: record.isPinned ?? false,
      now,
      today,
      author,
      partner,
    },
  };
};
