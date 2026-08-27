import type { FilterState } from "../types";
import { useState, useMemo } from "react";

import { useRecords } from "./use-records.hook";
import { useSections } from "./use-sections.hook";

export const useFilter = () => {
  const { data: allRecords = [] } = useRecords();
  const { data: sections = [] } = useSections();

  const [filters, setFilters] = useState<FilterState>({
    sectionIds: [],
    tags: [],
    dateFrom: null,
    dateTo: null,
    status: "all",
    pinned: "all",
  });

  const filteredRecords = useMemo(() => {
    let result = [...allRecords];

    if (filters.sectionIds.length > 0) {
      result = result.filter((r) => filters.sectionIds.includes(r.sectionId));
    }

    if (filters.tags.length > 0) {
      result = result.filter((r) =>
        filters.tags.some((tag) => r.tags.includes(tag)),
      );
    }

    if (filters.dateFrom) {
      result = result.filter(
        (r) => r.dateEvent && new Date(r.dateEvent) >= filters.dateFrom!,
      );
    }

    if (filters.dateTo) {
      result = result.filter(
        (r) => r.dateEvent && new Date(r.dateEvent) <= filters.dateTo!,
      );
    }

    if (filters.status === "completed") {
      result = result.filter((r) => r.isCompleted);
    } else if (filters.status === "active") {
      result = result.filter((r) => !r.isCompleted);
    }

    if (filters.pinned === "pinned") {
      result = result.filter((r) => r.isPinned);
    } else if (filters.pinned === "unpinned") {
      result = result.filter((r) => !r.isPinned);
    }

    result.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.dateEvent && b.dateEvent) {
        return (
          new Date(a.dateEvent).getTime() - new Date(b.dateEvent).getTime()
        );
      }
      return 0;
    });

    return result;
  }, [allRecords, filters]);

  const toggleSection = (sectionId: string) => {
    setFilters((prev) => ({
      ...prev,
      sectionIds: prev.sectionIds.includes(sectionId)
        ? prev.sectionIds.filter((id) => id !== sectionId)
        : [...prev.sectionIds, sectionId],
    }));
  };

  const handleTagChange = (text: string) => {
    const tags = text
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setFilters((prev) => ({ ...prev, tags }));
  };

  const resetFilters = () => {
    setFilters({
      sectionIds: [],
      tags: [],
      dateFrom: null,
      dateTo: null,
      status: "all",
      pinned: "all",
    });
  };

  return {
    sections,
    filters,
    setFilters,
    filteredRecords,
    toggleSection,
    handleTagChange,
    resetFilters,
  };
};
