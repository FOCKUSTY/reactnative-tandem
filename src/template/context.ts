import type { TemplateContext, TemplateRecord } from "./types";

const safeDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const buildContext = (record: TemplateRecord): TemplateContext => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const date = safeDate(record.dateEvent);
  const createdAt = safeDate(record.createdAt) ?? now;
  const updatedAt = safeDate(record.updatedAt) ?? now;

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
    },
  };
};
