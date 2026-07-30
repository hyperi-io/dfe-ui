'use client';

import { useFetchInfiniteFilteredServiceConfigs } from '@/Services/hooks/serviceConfigs/useFetchInfiniteFilteredServiceConfigs';
import type {
  TServiceConfigListResponse,
  UseFetchInfiniteFilteredServiceConfigsProps,
} from '@/Services/hooks/serviceConfigs/useFetchInfiniteFilteredServiceConfigs/types';

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

interface ListServicesQueryParams extends Omit<
  UseFetchInfiniteFilteredServiceConfigsProps,
  'page'
> {
  service_name?: string;
  service_instance?: string;
}

const parseFiltersFromParams = (
  params: URLSearchParams,
): UseFetchInfiniteFilteredServiceConfigsProps => {
  const searchParam = params.get('search');
  const search =
    searchParam === null || searchParam === '' ? undefined : searchParam;
  const serviceParam = params.get('service');
  const service =
    serviceParam === null || serviceParam === '' ? undefined : serviceParam;
  const sort_by = params.get('sort_by') ?? undefined;
  const sort_order = params.get('sort_order') ?? undefined;
  const per_pageParam = params.get('per_page');
  const per_page = per_pageParam ? parseInt(per_pageParam, 10) : undefined;
  return { search, service, sort_by, sort_order, per_page };
};

const filtersToSearchString = (f: ListServicesQueryParams): string => {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.service) params.set('service', f.service);
  if (f.sort_by) params.set('sort_by', f.sort_by);
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.service_name) params.set('service_name', f.service_name);
  if (f.service_instance) params.set('service_instance', f.service_instance);
  return params.toString();
};

const hasAnyFilters = (f: ListServicesQueryParams) =>
  f.service !== undefined ||
  f.search !== undefined ||
  f.sort_by !== undefined ||
  f.sort_order !== undefined;

export interface ListServicesContextValue {
  data: TServiceConfigListResponse;
  filters: UseFetchInfiniteFilteredServiceConfigsProps;
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredServiceConfigsProps) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  selectedService: {
    service_name: string | null;
    service_instance: string | null;
  };
  setSelectedService: ({
    service_name,
    service_instance,
  }: {
    service_name: string | null;
    service_instance: string | null;
  }) => void;
}

const DEFAULT_SERVICE_LIST_RESPONSE: TServiceConfigListResponse = {
  items: [] as TServiceConfigListResponse['items'],
  total: 0,
  page: 1,
  per_page: 10,
  total_pages: 0,
  next_page: null,
  prev_page: null,
};

const ListServicesContext = createContext<ListServicesContextValue | null>(
  null,
);

export interface ListServicesProviderProps {
  children: ReactNode;
  defaultFilters?: UseFetchInfiniteFilteredServiceConfigsProps;
}

export const ListServicesProvider = ({
  children,
  defaultFilters = {},
}: ListServicesProviderProps) => {
  const queryClient = useQueryClient();
  const [selectedService, setSelectedService] = useState<{
    service_name: string | null;
    service_instance: string | null;
  }>({
    service_name: null,
    service_instance: null,
  });
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredServiceConfigsProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters) ? urlFilters : defaultFilters;
  }, [searchParams, defaultFilters]);

  useEffect(() => {
    const service_name = searchParams.get('service_name');
    const service_instance = searchParams.get('service_instance');
    startTransition(() =>
      setSelectedService({
        service_name: service_name && service_name !== '' ? service_name : null,
        service_instance:
          service_instance && service_instance !== '' ? service_instance : null,
      }),
    );
  }, [searchParams]);

  const hasFilters = useMemo(() => hasAnyFilters(filters), [filters]);

  const {
    data = DEFAULT_SERVICE_LIST_RESPONSE,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredServiceConfigs({
    service: filters.service,
    search: filters.search,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
  });

  const handleSetFilters = useCallback(
    (newFilters: UseFetchInfiniteFilteredServiceConfigsProps) => {
      void queryClient.cancelQueries({ queryKey: ['services'] });

      const updated: ListServicesQueryParams = {
        ...filters,
        ...newFilters,
      };
      const query = filtersToSearchString(updated);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [queryClient, router, pathname, filters],
  );

  const handleSetSelectedService = useCallback(
    ({
      service_name,
      service_instance,
    }: {
      service_name: string | null;
      service_instance: string | null;
    }) => {
      setSelectedService({
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
    [router, pathname, filters, setSelectedService],
  );

  const value = useMemo<ListServicesContextValue>(
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
      selectedService,
      setSelectedService: handleSetSelectedService,
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
      selectedService,
      handleSetSelectedService,
    ],
  );

  return (
    <ListServicesContext.Provider value={value}>
      {children}
    </ListServicesContext.Provider>
  );
};

export const useListServicesContext = () => {
  const context = useContext(ListServicesContext);
  if (!context) {
    throw new Error(
      'useListServicesContext must be used within a ListServicesProvider',
    );
  }
  return context;
};
