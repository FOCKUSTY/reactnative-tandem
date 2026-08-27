import { useState } from "react";
import { useFilters } from "../contexts";

export const useFiltersForm = () => {
  const { filters, setFilters, clearFilters } = useFilters();

  const [search, setSearch] = useState(filters.search || "");
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(
    filters.sectionIds || [],
  );
  const [tagsInput, setTagsInput] = useState(filters.tags?.join(", ") || "");
  const [isCompleted, setIsCompleted] = useState<boolean | undefined>(
    filters.isCompleted,
  );
  const [isPinned, setIsPinned] = useState<boolean | undefined>(
    filters.isPinned,
  );
  const [sortBy, setSortBy] = useState<
    "dateEvent" | "createdAt" | "updatedAt" | "title"
  >(filters.sortBy || "dateEvent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    filters.sortOrder || "asc",
  );

  const resetForm = () => {
    setSearch("");
    setSelectedSectionIds([]);
    setTagsInput("");
    setIsCompleted(undefined);
    setIsPinned(undefined);
    setSortBy("dateEvent");
    setSortOrder("asc");
  };

  const applyFilters = () => {
    const newFilters: any = {
      search: search.trim() || undefined,
      sectionIds:
        selectedSectionIds.length > 0 ? selectedSectionIds : undefined,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      isCompleted,
      isPinned,
      sortBy,
      sortOrder,
    };
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key] === undefined || newFilters[key] === null) {
        delete newFilters[key];
      }
    });
    setFilters(newFilters);
  };

  const clearAll = () => {
    clearFilters();
    resetForm();
  };

  return {
    search,
    setSearch,
    selectedSectionIds,
    setSelectedSectionIds,
    tagsInput,
    setTagsInput,
    isCompleted,
    setIsCompleted,
    isPinned,
    setIsPinned,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    applyFilters,
    clearAll,
    resetForm,
  };
};
