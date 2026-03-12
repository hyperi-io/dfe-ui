'use client';

import { useFetchInfiniteFilteredSources } from '@/Sources/hooks/useFetchInfiniteFilteredSources';
import type {
  SourceListResponse,
  UseFetchInfiniteFilteredSourcesProps,
} from '@/Sources/hooks/useFetchInfiniteFilteredSources/types';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

const parseFiltersFromParams = (
  params: URLSearchParams,
): UseFetchInfiniteFilteredSourcesProps => {
  const searchParam = params.get('search');
  const search =
    searchParam === null || searchParam === '' ? undefined : searchParam;
  const enabledParam = params.get('enabled');
  const enabled =
    enabledParam === 'true' || enabledParam === 'false'
      ? enabledParam
      : undefined;
  const sort_by = params.get('sort_by') ?? undefined;
  const sort_order = params.get('sort_order') ?? undefined;
  const per_pageParam = params.get('per_page');
  const per_page = per_pageParam ? parseInt(per_pageParam, 10) : undefined;
  return { search, enabled, sort_by, sort_order, per_page };
};

const filtersToSearchString = (
  f: UseFetchInfiniteFilteredSourcesProps,
): string => {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.enabled !== undefined) params.set('enabled', String(f.enabled));
  if (f.sort_by) params.set('sort_by', f.sort_by);
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.per_page !== undefined) params.set('per_page', String(f.per_page));
  return params.toString();
};

const hasAnyFilters = (f: UseFetchInfiniteFilteredSourcesProps) =>
  f.search !== undefined ||
  f.enabled !== undefined ||
  f.sort_by !== undefined ||
  f.sort_order !== undefined ||
  f.per_page !== undefined;

export interface ListSourcesContextValue {
  data: SourceListResponse;
  filters: UseFetchInfiniteFilteredSourcesProps;
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredSourcesProps) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
}

const DEFAULT_SOURCE_LIST_RESPONSE: SourceListResponse = {
  items: [] as SourceListResponse['items'],
  total: 0,
  page: 1,
  per_page: 10,
  total_pages: 0,
  next_page: null,
  prev_page: null,
};

const ListSourcesContext = createContext<ListSourcesContextValue | null>(null);

export interface ListSourcesProviderProps {
  children: ReactNode;
  defaultFilters?: UseFetchInfiniteFilteredSourcesProps;
}

export const ListSourcesProvider = ({
  children,
  defaultFilters = {},
}: ListSourcesProviderProps) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredSourcesProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters) ? urlFilters : defaultFilters;
  }, [searchParams, defaultFilters]);

  const hasFilters = useMemo(() => {
    return !!filters.search || filters.enabled !== undefined;
  }, [filters]);

  const {
    data = DEFAULT_SOURCE_LIST_RESPONSE,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredSources(filters);

  const handleSetFilters = useCallback(
    (newFilters: UseFetchInfiniteFilteredSourcesProps) => {
      const updated = { ...filters, ...newFilters };
      const query = filtersToSearchString(updated);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters],
  );

  const value = useMemo<ListSourcesContextValue>(
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
    ],
  );

  return (
    <ListSourcesContext.Provider value={value}>
      {children}
    </ListSourcesContext.Provider>
  );
};

export const useListSourcesContext = () => {
  const context = useContext(ListSourcesContext);
  if (!context) {
    throw new Error(
      'useListSourcesContext must be used within a ListSourcesProvider',
    );
  }
  return context;
};
