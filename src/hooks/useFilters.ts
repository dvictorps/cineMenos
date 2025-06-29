import { useMemo } from 'react';

export function useFilters<T>(
  data: T[],
  filters: Record<string, unknown>,
  filterFunctions: Record<string, (item: T, value: unknown) => boolean>
) {
  return useMemo(() => {
    return data.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value || (typeof value === 'string' && value === 'todos')) return true;
        return filterFunctions[key]?.(item, value) ?? true;
      });
    });
  }, [data, filters, filterFunctions]);
}

export function useTextFilter<T>(
  data: T[],
  searchText: string,
  searchFields: (keyof T)[]
) {
  return useMemo(() => {
    if (!searchText.trim()) return data;
    
    const searchLower = searchText.toLowerCase();
    return data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        return String(value).toLowerCase().includes(searchLower);
      });
    });
  }, [data, searchText, searchFields]);
} 