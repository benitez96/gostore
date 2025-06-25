import { useState } from "react";

export interface UseFiltersReturn<T> {
  filters: T;
  updateFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  resetFilters: () => void;
  clearFilter: <K extends keyof T>(key: K) => void;
}

export const useFilters = <T extends Record<string, any>>(
  initialFilters: T
): UseFiltersReturn<T> => {
  const [filters, setFilters] = useState<T>(initialFilters);

  const updateFilter = <K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const clearFilter = <K extends keyof T>(key: K) => {
    setFilters(prev => ({ ...prev, [key]: initialFilters[key] }));
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    clearFilter,
  };
}; 