'use client';

import { useFetchInfiniteFilteredSources } from '@/core/hooks/useFetchInfiniteFilteredSources';
import type {
  SourceListResponse,
  UseFetchInfiniteFilteredSourcesProps,
} from '@/core/hooks/useFetchInfiniteFilteredSources/types';

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

interface ListSourcesQueryParams extends Omit<
  UseFetchInfiniteFilteredSourcesProps,
  'page'
> {
  source_name?: string;
  source_version?: string;
}

const parseFiltersFromParams = (
  params: URLSearchParams,
): UseFetchInfiniteFilteredSourcesProps => {
  const searchParam = params.get('search');
  const search =
    searchParam === null || searchParam === '' ? undefined : searchParam;
  const enabledParam = params.get('enabled');
  const enabled =
    enabledParam === 'true'
      ? true
      : enabledParam === 'false'
        ? false
        : undefined;
  const sort_by = params.get('sort_by') ?? undefined;
  const sort_order = params.get('sort_order') ?? undefined;
  return { search, enabled, sort_by, sort_order };
};

const applyListFiltersToSearchParams = (
  params: URLSearchParams,
  f: UseFetchInfiniteFilteredSourcesProps,
) => {
  if (f.search) params.set('search', f.search);
  else params.delete('search');
  if (f.enabled !== undefined) params.set('enabled', String(f.enabled));
  else params.delete('enabled');
  if (f.sort_by) params.set('sort_by', f.sort_by);
  else params.delete('sort_by');
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.source_name) params.set('source_name', f.source_name);
  if (f.source_version) params.set('source_version', f.source_version);
  return params.toString();
};

const hasAnyFilters = (f: ListSourcesQueryParams) =>
  f.search !== undefined ||
  f.enabled !== undefined ||
  f.sort_by !== undefined ||
  f.sort_order !== undefined ||
  f.source_name !== undefined;

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
  selectedSourceVersion: string | null;
  setSelectedSource: ({
    source_name,
    source_version,
  }: {
    source_name: string | null;
    source_version: string | null;
  }) => void;
}

const DEFAULT_SOURCE_LIST_RESPONSE: SourceListResponse = {
  items: [] as SourceListResponse['items'],
  objects: {},
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
  const queryClient = useQueryClient();
  const [selectedSourceName, setSelectedSourceName] = useState<string | null>(
    null,
  );
  const [selectedSourceVersion, setSelectedSourceVersion] = useState<
    string | null
  >(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredSourcesProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters)
      ? urlFilters
      : { ...defaultFilters, ...urlFilters };
  }, [searchParams, defaultFilters]);

  useEffect(() => {
    const source_name = searchParams.get('source_name');
    const source_version = searchParams.get('source_version');
    startTransition(() => {
      setSelectedSourceName(
        source_name && source_name !== '' ? source_name : null,
      );
      setSelectedSourceVersion(
        source_version && source_version !== '' ? source_version : null,
      );
    });
  }, [searchParams]);

  const hasFilters = useMemo(() => hasAnyFilters(filters), [filters]);

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
      void queryClient.cancelQueries({ queryKey: ['sources'] });
      const updated: UseFetchInfiniteFilteredSourcesProps = {
        ...filters,
        ...newFilters,
      };

      const query = filtersToSearchString(updated, searchParams);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [queryClient, router, pathname, filters, searchParams],
  );

  const handleSetSelectedSource = useCallback(
    ({
      source_name,
      source_version,
    }: {
      source_name: string | null;
      source_version: string | null;
    }) => {
      setSelectedSourceName(source_name);
      setSelectedSourceVersion(source_version);
      const query = filtersToSearchString({
        ...filters,
        source_name: source_name ?? '',
        source_version: source_version ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [
      router,
      pathname,
      filters,
      setSelectedSourceName,
      setSelectedSourceVersion,
    ],
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
      setSelectedSource: handleSetSelectedSource,
      selectedSourceVersion,
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
      handleSetSelectedSource,
      selectedSourceVersion,
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
