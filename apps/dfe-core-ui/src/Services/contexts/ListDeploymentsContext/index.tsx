'use client';

import { useFetchInfiniteFilteredDeployments } from '@/Services/hooks/deployments/useFetchInfiniteFilteredDeployments';
import type {
  TDeploymentsResponse,
  UseFetchInfiniteFilteredDeploymentsProps,
} from '@/Services/hooks/deployments/useFetchInfiniteFilteredDeployments/types';

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

interface ListDeploymentsQueryParams extends Omit<
  UseFetchInfiniteFilteredDeploymentsProps,
  'page'
> {
  service_name?: string;
  service_instance?: string;
}

const parseFiltersFromParams = (
  params: URLSearchParams,
): UseFetchInfiniteFilteredDeploymentsProps => {
  const searchParam = params.get('search');
  const search =
    searchParam === null || searchParam === '' ? undefined : searchParam;
  const serviceParam = params.get('service');
  const service =
    serviceParam === null || serviceParam === '' ? undefined : serviceParam;
  const sort_by = params.get('sort_by') as
    | 'service'
    | 'instance'
    | 'updated_at'
    | undefined;
  const sort_order = params.get('sort_order') as 'asc' | 'desc' | undefined;
  const per_pageParam = params.get('per_page');
  const per_page = per_pageParam ? parseInt(per_pageParam, 10) : undefined;
  return { search, service, sort_by, sort_order, per_page };
};

const filtersToSearchString = (f: ListDeploymentsQueryParams): string => {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.service) params.set('service', f.service);
  if (f.sort_by) params.set('sort_by', f.sort_by);
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.service_name) params.set('service_name', f.service_name);
  if (f.service_instance) params.set('service_instance', f.service_instance);
  return params.toString();
};

const hasAnyFilters = (f: ListDeploymentsQueryParams) =>
  f.service !== undefined ||
  f.search !== undefined ||
  f.sort_by !== undefined ||
  f.sort_order !== undefined;

export interface ListDeploymentsContextValue {
  data: TDeploymentsResponse;
  filters: UseFetchInfiniteFilteredDeploymentsProps;
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredDeploymentsProps) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  selectedDeployment: {
    service_name: string | null;
    service_instance: string | null;
  };
  setSelectedDeployment: ({
    service_name,
    service_instance,
  }: {
    service_name: string | null;
    service_instance: string | null;
  }) => void;
}

const DEFAULT_DEPLOYMENTS_LIST_RESPONSE: TDeploymentsResponse = {
  items: [] as TDeploymentsResponse['items'],
  total: 0,
  page: 1,
  per_page: 10,
  total_pages: 0,
  next_page: null,
  prev_page: null,
};

const ListDeploymentsContext =
  createContext<ListDeploymentsContextValue | null>(null);

export interface ListDeploymentsProviderProps {
  children: ReactNode;
  defaultFilters?: UseFetchInfiniteFilteredDeploymentsProps;
}

export const ListDeploymentsProvider = ({
  children,
  defaultFilters = {},
}: ListDeploymentsProviderProps) => {
  const queryClient = useQueryClient();
  const [selectedDeployment, setSelectedDeployment] = useState<{
    service_name: string | null;
    service_instance: string | null;
  }>({
    service_name: null,
    service_instance: null,
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredDeploymentsProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters) ? urlFilters : defaultFilters;
  }, [searchParams, defaultFilters]);

  useEffect(() => {
    const service_name = searchParams.get('service_name');
    const service_instance = searchParams.get('service_instance');
    startTransition(() =>
      setSelectedDeployment({
        service_name: service_name && service_name !== '' ? service_name : null,
        service_instance:
          service_instance && service_instance !== '' ? service_instance : null,
      }),
    );
  }, [searchParams]);

  const hasFilters = useMemo(() => hasAnyFilters(filters), [filters]);

  const {
    data = DEFAULT_DEPLOYMENTS_LIST_RESPONSE,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredDeployments({
    service: filters.service,
    search: filters.search,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
  });

  const handleSetFilters = useCallback(
    (newFilters: UseFetchInfiniteFilteredDeploymentsProps) => {
      void queryClient.cancelQueries({ queryKey: ['services'] });

      const updated: ListDeploymentsQueryParams = {
        ...filters,
        ...newFilters,
      };
      const query = filtersToSearchString(updated);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [queryClient, router, pathname, filters],
  );

  const handleSetSelectedDeployment = useCallback(
    ({
      service_name,
      service_instance,
    }: {
      service_name: string | null;
      service_instance: string | null;
    }) => {
      setSelectedDeployment({
        service_name,
        service_instance,
      });
      const query = filtersToSearchString({
        ...filters,
        service_name: service_name ?? '',
        service_instance: service_instance ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters, setSelectedDeployment],
  );

  const value = useMemo<ListDeploymentsContextValue>(
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
      selectedDeployment,
      setSelectedDeployment: handleSetSelectedDeployment,
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
      selectedDeployment,
      handleSetSelectedDeployment,
    ],
  );

  return (
    <ListDeploymentsContext.Provider value={value}>
      {children}
    </ListDeploymentsContext.Provider>
  );
};

export const useListDeploymentsContext = () => {
  const context = useContext(ListDeploymentsContext);
  if (!context) {
    throw new Error(
      'useListDeploymentsContext must be used within a ListDeploymentsProvider',
    );
  }
  return context;
};
