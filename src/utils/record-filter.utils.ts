import type { MyRecord } from "../types";

export const getFilteredRecords = (
  records: MyRecord[],
  options?: {
    onlyFuture?: boolean;
    hideCompleted?: boolean;
  },
): MyRecord[] => {
  let filtered = [...records];

  if (options?.onlyFuture) {
    const now = new Date();
    filtered = filtered.filter(
      (record) => record.dateEvent && new Date(record.dateEvent) >= now,
    );
  }

  if (options?.hideCompleted) {
    filtered = filtered.filter((r) => !r.isCompleted);
  }

  return filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;

    if (a.dateEvent && b.dateEvent) {
      return new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime();
    }
    if (a.dateEvent && !b.dateEvent) return -1;
    if (!a.dateEvent && b.dateEvent) return 1;

    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });
};

export type ReportTiming = "before" | "after";

/**
 * before — событие ещё в будущем (отчёт «до»)
 * after  — событие уже прошло (отчёт «после»)
 * null   — это не отчёт или нет валидной даты
 */
export const getReportTiming = (record: MyRecord): ReportTiming | null => {
  if (!record.isReport) return null;
  if (!record.dateEvent) return null;

  const time = new Date(record.dateEvent).getTime();
  if (Number.isNaN(time)) return null;

  return time > Date.now() ? "before" : "after";
};

export const splitReportsByTiming = (records: MyRecord[]) => {
  const before: MyRecord[] = [];
  const after: MyRecord[] = [];

  for (const record of records) {
    const timing = getReportTiming(record);
    if (timing === "before") before.push(record);
    else if (timing === "after") after.push(record);
  }

  return { before, after };
};
