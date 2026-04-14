'use client';

import type {
  SchemaListResponse,
  UseFetchInfiniteFilteredSchemasProps,
} from '@/Schemas/hooks/useFetchInfiniteFilteredSchemas/types';

import { useFetchInfiniteFilteredSchemas } from '@/Schemas/hooks/useFetchInfiniteFilteredSchemas';
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

interface ListSchemasQueryParams extends Omit<
  UseFetchInfiniteFilteredSchemasProps,
  'page'
> {
  schema_path?: string;
  schema_version?: string;
}

const parseFiltersFromParams = (
  params: URLSearchParams,
): ListSchemasQueryParams => {
  // Schema detail params
  const schemaParam = params.get('schema_path');
  const schema_path =
    schemaParam === null || schemaParam === '' ? undefined : schemaParam;
  const schemaVersionParam = params.get('schema_version');
  const schema_version =
    schemaVersionParam === null || schemaVersionParam === ''
      ? undefined
      : schemaVersionParam;

  // List schema filter params
  const searchParam = params.get('search');
  const search =
    searchParam === null || searchParam === '' ? undefined : searchParam;
  const path_prefixParam = params.get('path_prefix');
  const path_prefix =
    path_prefixParam === null || path_prefixParam === ''
      ? undefined
      : path_prefixParam;
  const sortByParam = params.get('sort_by');
  const sort_by: UseFetchInfiniteFilteredSchemasProps['sort_by'] =
    sortByParam === 'path' ||
    sortByParam === 'current_version' ||
    sortByParam === 'column_count'
      ? sortByParam
      : undefined;
  const sortOrderParam = params.get('sort_order');
  const sort_order: UseFetchInfiniteFilteredSchemasProps['sort_order'] =
    sortOrderParam === 'asc' || sortOrderParam === 'desc'
      ? sortOrderParam
      : undefined;
  return {
    search,
    path_prefix,
    sort_by,
    sort_order,
    schema_path,
    schema_version,
  };
};

const filtersToSearchString = (f: ListSchemasQueryParams): string => {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.sort_by) params.set('sort_by', f.sort_by);
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.path_prefix) params.set('path_prefix', f.path_prefix);
  if (f.schema_path) params.set('schema_path', f.schema_path);
  if (f.schema_version) params.set('schema_version', f.schema_version);
  return params.toString();
};

const hasAnyFilters = (f: ListSchemasQueryParams) =>
  f.search !== undefined ||
  f.path_prefix !== undefined ||
  f.sort_by !== undefined ||
  f.sort_order !== undefined;

export interface ListSchemasContextValue {
  data: SchemaListResponse;
  filters: UseFetchInfiniteFilteredSchemasProps;
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredSchemasProps) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  selectedSchemaPath: string | null;
  setSelectedSchemaPath: (schema_path: string | null) => void;
  selectedSchemaVersion: string | null;
  setSelectedSchemaVersion: (
    schema_version: string | null,
    schema_path?: string | null,
  ) => void;
}

const DEFAULT_SCHEMA_LIST_RESPONSE: SchemaListResponse = {
  items: [] as SchemaListResponse['items'],
  total: 0,
  page: 1,
  per_page: 10,
  total_pages: 0,
  next_page: null,
  prev_page: null,
};

const ListSchemasContext = createContext<ListSchemasContextValue | null>(null);

export interface ListSchemasProviderProps {
  children: ReactNode;
  defaultFilters?: UseFetchInfiniteFilteredSchemasProps;
}

export const ListSchemasProvider = ({
  children,
  defaultFilters = {},
}: ListSchemasProviderProps) => {
  const queryClient = useQueryClient();
  const [selectedSchemaPath, setSelectedSchemaPath] = useState<string | null>(
    null,
  );
  const [selectedSchemaVersion, setSelectedSchemaVersion] = useState<
    string | null
  >(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredSchemasProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters)
      ? urlFilters
      : { ...defaultFilters, ...urlFilters };
  }, [searchParams, defaultFilters]);

  useEffect(() => {
    const schema_path = searchParams.get('schema_path');
    const schema_version = searchParams.get('schema_version');
    startTransition(() => {
      setSelectedSchemaPath(
        schema_path && schema_path !== '' ? schema_path : null,
      );
      setSelectedSchemaVersion(
        schema_version && schema_version !== '' ? schema_version : null,
      );
    });
  }, [searchParams]);

  const hasFilters = useMemo(() => hasAnyFilters(filters), [filters]);

  const {
    data = DEFAULT_SCHEMA_LIST_RESPONSE,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredSchemas(filters);

  const handleSetFilters = useCallback(
    (newFilters: UseFetchInfiniteFilteredSchemasProps) => {
      void queryClient.cancelQueries({ queryKey: ['schemas'] });
      const updated: ListSchemasQueryParams = {
        ...filters,
        ...newFilters,
      };

      const query = filtersToSearchString(updated);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [queryClient, router, pathname, filters],
  );

  const handleSetSelectedSchemaPath = useCallback(
    (schema_path: string | null) => {
      setSelectedSchemaPath(schema_path);
      const query = filtersToSearchString({
        ...filters,
        schema_path: schema_path ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters, setSelectedSchemaPath],
  );

  const handleSetSelectedSchemaVersion = useCallback(
    (schema_version: string | null, schema_path?: string | null) => {
      if (schema_path != null && schema_path !== '') {
        setSelectedSchemaPath(schema_path);
      }
      setSelectedSchemaVersion(schema_version);
      const query = filtersToSearchString({
        ...filters,
        schema_version: schema_version ?? '',
        schema_path: schema_path ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters, setSelectedSchemaVersion],
  );

  const value = useMemo<ListSchemasContextValue>(
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
      selectedSchemaPath,
      setSelectedSchemaPath: handleSetSelectedSchemaPath,
      selectedSchemaVersion,
      setSelectedSchemaVersion: handleSetSelectedSchemaVersion,
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
      selectedSchemaPath,
      handleSetSelectedSchemaPath,
      selectedSchemaVersion,
      handleSetSelectedSchemaVersion,
    ],
  );

  return (
    <ListSchemasContext.Provider value={value}>
      {children}
    </ListSchemasContext.Provider>
  );
};

export const useListSchemasContext = () => {
  const context = useContext(ListSchemasContext);
  if (!context) {
    throw new Error(
      'useListSchemasContext must be used within a ListSchemasProvider',
    );
  }
  return context;
};
