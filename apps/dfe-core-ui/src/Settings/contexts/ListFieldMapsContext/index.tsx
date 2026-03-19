'use client';

import { useFetchInfiniteFilteredFieldMaps } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps';
import type {
  FieldMapListResponse,
  UseFetchInfiniteFilteredFieldMapsProps,
} from '@/core/hooks/useFetchInfiniteFilteredFieldMaps/types';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  startTransition,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface ListFieldMapsQueryParams extends Omit<
  UseFetchInfiniteFilteredFieldMapsProps,
  'page'
> {
  standard?: string;
}

const parseFiltersFromParams = (
  params: URLSearchParams,
): UseFetchInfiniteFilteredFieldMapsProps => {
  const searchParam = params.get('search');
  const search =
    searchParam === null || searchParam === '' ? undefined : searchParam;
  const standardParam = params.get('standard');
  const standard =
    standardParam === null || standardParam === '' ? undefined : standardParam;
  const sort_by = params.get('sort_by') ?? undefined;
  const sort_order = params.get('sort_order') ?? undefined;
  const per_pageParam = params.get('per_page');
  const per_page = per_pageParam ? parseInt(per_pageParam, 10) : undefined;
  return { search, standard, sort_by, sort_order, per_page };
};

const filtersToSearchString = (f: ListFieldMapsQueryParams): string => {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.standard) params.set('standard', f.standard);
  if (f.sort_by) params.set('sort_by', f.sort_by);
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.map_standard) params.set('map_standard', f.map_standard);
  if (f.map_source) params.set('map_source', f.map_source);
  return params.toString();
};

const hasAnyFilters = (f: ListFieldMapsQueryParams) =>
  f.standard !== undefined ||
  f.search !== undefined ||
  f.sort_by !== undefined ||
  f.sort_order !== undefined;

export interface ListFieldMapsContextValue {
  data: FieldMapListResponse;
  filters: UseFetchInfiniteFilteredFieldMapsProps;
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredFieldMapsProps) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  selectedFieldMap: {
    map_source: string | null;
    map_standard: string | null;
  } | null;
  setSelectedFieldMap: ({
    map_source,
    map_standard,
  }: {
    map_source: string | null;
    map_standard: string | null;
  }) => void;
}

const DEFAULT_FIELD_MAP_LIST_RESPONSE: FieldMapListResponse = {
  items: [] as FieldMapListResponse['items'],
  total: 0,
  page: 1,
  per_page: 10,
  total_pages: 0,
  next_page: null,
  prev_page: null,
};

const ListFieldMapsContext = createContext<ListFieldMapsContextValue | null>(
  null,
);

export interface ListFieldMapsProviderProps {
  children: ReactNode;
  defaultFilters?: UseFetchInfiniteFilteredFieldMapsProps;
}

export const ListFieldMapsProvider = ({
  children,
  defaultFilters = {},
}: ListFieldMapsProviderProps) => {
  const queryClient = useQueryClient();
  const [selectedFieldMap, setSelectedFieldMap] = useState<{
    map_source: string | null;
    map_standard: string | null;
  } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredFieldMapsProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters) ? urlFilters : defaultFilters;
  }, [searchParams, defaultFilters]);

  useEffect(() => {
    const map_standard = searchParams.get('map_standard');
    const map_source = searchParams.get('map_source');
    startTransition(() =>
      setSelectedFieldMap({
        map_source: map_source && map_source !== '' ? map_source : null,
        map_standard: map_standard && map_standard !== '' ? map_standard : null,
      }),
    );
  }, [searchParams]);

  const hasFilters = useMemo(() => hasAnyFilters(filters), [filters]);

  const {
    data = DEFAULT_FIELD_MAP_LIST_RESPONSE,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredFieldMaps({
    standard: filters.standard,
    search: filters.search,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
  });

  const handleSetFilters = useCallback(
    (newFilters: UseFetchInfiniteFilteredFieldMapsProps) => {
      void queryClient.cancelQueries({ queryKey: ['field-maps'] });

      const updated: ListFieldMapsQueryParams = {
        ...filters,
        ...newFilters,
      };
      const query = filtersToSearchString(updated);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [queryClient, router, pathname, filters],
  );

  const handleSetSelectedFieldMap = useCallback(
    ({
      map_source,
      map_standard,
    }: {
      map_source: string | null;
      map_standard: string | null;
    }) => {
      setSelectedFieldMap({
        map_source: map_source,
        map_standard: map_standard,
      });
      const query = filtersToSearchString({
        ...filters,
        map_source: map_source ?? '',
        map_standard: map_standard ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters, setSelectedFieldMap],
  );

  const value = useMemo<ListFieldMapsContextValue>(
    () => ({
      data,
      filters,
      hasFilters,
      setFilters: handleSetFilters,
      isLoading,
      isError,
      error: error ?? null,
      refetch,
      fetchNextPage,
      hasNextPage,
      loadMoreRef,
      isFetchingNextPage,
      selectedFieldMap,
      setSelectedFieldMap: handleSetSelectedFieldMap,
    }),
    [
      data,
      filters,
      hasFilters,
      handleSetFilters,
      isLoading,
      isError,
      error,
      refetch,
      fetchNextPage,
      hasNextPage,
      loadMoreRef,
      isFetchingNextPage,
      selectedFieldMap,
      handleSetSelectedFieldMap,
    ],
  );

  return (
    <ListFieldMapsContext.Provider value={value}>
      {children}
    </ListFieldMapsContext.Provider>
  );
};

export const useListFieldMapsContext = () => {
  const context = useContext(ListFieldMapsContext);
  if (!context) {
    throw new Error(
      'useListFieldMapsContext must be used within a ListFieldMapsProvider',
    );
  }
  return context;
};
