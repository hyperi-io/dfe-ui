'use client';

import { useFetchInfiniteFilteredHunts } from '@/Hunts/hooks/useFetchInfiniteFilteredHunts';
import type {
  HuntSortBy,
  THuntListItem,
  THuntListResponse,
  UseFetchInfiniteFilteredHuntsProps,
} from '@/Hunts/hooks/useFetchInfiniteFilteredHunts/types';

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

interface ListHuntsQueryParams extends Omit<
  UseFetchInfiniteFilteredHuntsProps,
  'page'
> {
  name?: string;
}

const parseFiltersFromParams = (
  params: URLSearchParams,
): UseFetchInfiniteFilteredHuntsProps => {
  const searchParam = params.get('search');
  const search =
    searchParam === null || searchParam === '' ? undefined : searchParam;
  const sort_by = (params.get('sort_by') as HuntSortBy) ?? undefined;
  const sort_order = (params.get('sort_order') as 'asc' | 'desc') ?? undefined;
  const per_pageParam = params.get('per_page');
  const per_page = per_pageParam ? parseInt(per_pageParam, 10) : undefined;
  return { search, sort_by, sort_order, per_page };
};

const filtersToSearchString = (f: ListHuntsQueryParams): string => {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.sort_by) params.set('sort_by', f.sort_by);
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.per_page) params.set('per_page', String(f.per_page));
  if (f.name) params.set('name', f.name);
  return params.toString();
};

const hasAnyFilters = (f: ListHuntsQueryParams) =>
  f.search !== undefined ||
  f.sort_by !== undefined ||
  f.sort_order !== undefined;

export interface ListHuntsContextValue {
  data: THuntListResponse;
  filters: UseFetchInfiniteFilteredHuntsProps;
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredHuntsProps) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  selectedHuntName: string | null;
  setSelectedHuntName: (name: string | null) => void;
}

const DEFAULT_HUNT_LIST_RESPONSE: THuntListResponse = {
  items: [] as THuntListItem[],
  total: 0,
  page: 1,
  per_page: 10,
  total_pages: 0,
  next_page: null,
  prev_page: null,
};

const ListHuntsContext = createContext<ListHuntsContextValue | null>(null);

export interface ListHuntsProviderProps {
  children: ReactNode;
  defaultFilters?: UseFetchInfiniteFilteredHuntsProps;
}

export const ListHuntsProvider = ({
  children,
  defaultFilters = {},
}: ListHuntsProviderProps) => {
  const queryClient = useQueryClient();
  const [selectedHuntName, setSelectedHuntName] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredHuntsProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters) ? urlFilters : defaultFilters;
  }, [searchParams, defaultFilters]);

  useEffect(() => {
    const name = searchParams.get('name');
    startTransition(() =>
      setSelectedHuntName(name && name !== '' ? name : null),
    );
  }, [searchParams]);

  const hasFilters = useMemo(() => hasAnyFilters(filters), [filters]);

  const {
    data = DEFAULT_HUNT_LIST_RESPONSE,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredHunts({
    search: filters.search,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
    per_page: filters.per_page,
  });

  const handleSetFilters = useCallback(
    (newFilters: UseFetchInfiniteFilteredHuntsProps) => {
      void queryClient.cancelQueries({ queryKey: ['hunts'] });

      const updated: ListHuntsQueryParams = {
        ...filters,
        ...newFilters,
        name: selectedHuntName ?? undefined,
      };
      const query = filtersToSearchString(updated);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [queryClient, router, pathname, filters, selectedHuntName],
  );

  const handleSetSelectedHuntName = useCallback(
    (name: string | null) => {
      setSelectedHuntName(name);
      const query = filtersToSearchString({
        ...filters,
        name: name ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters],
  );

  const value = useMemo<ListHuntsContextValue>(
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
      selectedHuntName,
      setSelectedHuntName: handleSetSelectedHuntName,
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
      selectedHuntName,
      handleSetSelectedHuntName,
    ],
  );

  return (
    <ListHuntsContext.Provider value={value}>
      {children}
    </ListHuntsContext.Provider>
  );
};

export const useListHuntsContext = () => {
  const context = useContext(ListHuntsContext);
  if (!context) {
    throw new Error(
      'useListHuntsContext must be used within a ListHuntsProvider',
    );
  }
  return context;
};
