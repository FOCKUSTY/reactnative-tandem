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
      (r) => r.dateEvent && new Date(r.dateEvent) >= now,
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
