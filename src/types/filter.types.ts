export type FilterState = {
  sectionIds: string[];
  tags: string[];
  dateFrom: Date | null;
  dateTo: Date | null;
  status: "all" | "completed" | "active";
  pinned: "all" | "pinned" | "unpinned";
};
