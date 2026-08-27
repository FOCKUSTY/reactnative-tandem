import React, { createContext, useState, useContext, ReactNode } from "react";

export interface RecordFilters {
  sectionIds?: string[];
  tags?: string[];
  isCompleted?: boolean;
  isPinned?: boolean;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  sortBy?: "dateEvent" | "createdAt" | "updatedAt" | "title";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

interface FiltersContextType {
  filters: RecordFilters;
  setFilters: (filters: RecordFilters) => void;
  clearFilters: () => void;
}

const defaultFilters: RecordFilters = {
  sortBy: "dateEvent",
  sortOrder: "asc",
  limit: 50,
  offset: 0,
};

const FiltersContext = createContext<FiltersContextType | undefined>(undefined);

export const FiltersProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [filters, setFiltersState] = useState<RecordFilters>(defaultFilters);

  const setFilters = (newFilters: RecordFilters) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFiltersState({ ...defaultFilters });
  };

  return (
    <FiltersContext.Provider value={{ filters, setFilters, clearFilters }}>
      {children}
    </FiltersContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FiltersContext);
  if (!context)
    throw new Error("useFilters must be used within FiltersProvider");
  return context;
};
