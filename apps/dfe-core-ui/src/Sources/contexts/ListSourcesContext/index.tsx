'use client';

import { useFetchInfiniteFilteredSources } from '@/Sources/hooks/useFetchInfiniteFilteredSources';
import type {
  SourceListResponse,
  UseFetchInfiniteFilteredSourcesProps,
} from '@/Sources/hooks/useFetchInfiniteFilteredSources/types';

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

interface ListSourcesQueryParams extends Omit<
  UseFetchInfiniteFilteredSourcesProps,
  'page'
> {
  source_name?: string;
}

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

const filtersToSearchString = (f: ListSourcesQueryParams): string => {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.enabled !== undefined) params.set('enabled', String(f.enabled));
  if (f.sort_by) params.set('sort_by', f.sort_by);
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.source_name) params.set('source_name', f.source_name);
  return params.toString();
};

const hasAnyFilters = (f: ListSourcesQueryParams) =>
  f.search !== undefined || f.enabled !== undefined;

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
  selectedSourceName: string | null;
  setSelectedSourceName: (source: string | null) => void;
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
  const [selectedSourceName, setSelectedSourceName] = useState<string | null>(
    null,
  );
  const [pendingFilters, setPendingFilters] =
    useState<UseFetchInfiniteFilteredSourcesProps | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredSourcesProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters) ? urlFilters : defaultFilters;
  }, [searchParams, defaultFilters]);

  // Clear optimistic filters when URL changes externally (e.g. browser back)
  useEffect(() => {
    startTransition(() => setPendingFilters(null));
  }, [searchParams]);

  const hasFilters = useMemo(
    () => hasAnyFilters(pendingFilters ?? filters),
    [pendingFilters, filters],
  );

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
      const source_name = searchParams.get('source_name') ?? undefined;
      const updated: ListSourcesQueryParams = {
        ...filters,
        ...newFilters,
        ...(source_name && { source_name }),
      };
      setPendingFilters(updated);
      const query = filtersToSearchString(updated);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters, searchParams],
  );

  const handleSetSelectedSourceName = useCallback(
    (source: string | null) => {
      setSelectedSourceName(source);
      const query = filtersToSearchString({
        ...filters,
        source_name: source ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters, setSelectedSourceName],
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
      selectedSourceName,
      setSelectedSourceName: handleSetSelectedSourceName,
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
      selectedSourceName,
      handleSetSelectedSourceName,
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
