import { useState, useEffect } from "react";

export interface UseSearchReturn {
  search: string;
  debouncedSearch: string;
  setSearch: (value: string) => void;
  clearSearch: () => void;
}

export const useSearch = (
  initialValue: string = "",
  delay: number = 500
): UseSearchReturn => {
  const [search, setSearch] = useState(initialValue);
  const [debouncedSearch, setDebouncedSearch] = useState(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, delay);

    return () => clearTimeout(timer);
  }, [search, delay]);

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
  };

  return {
    search,
    debouncedSearch,
    setSearch,
    clearSearch,
  };
}; 