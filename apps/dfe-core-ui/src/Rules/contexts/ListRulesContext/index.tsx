'use client';

import { useFetchInfiniteFilteredRules } from '@/Rules/hooks/useFetchInfiniteFilteredRules';
import type {
  RuleListResponse,
  UseFetchInfiniteFilteredRulesProps,
} from '@/Rules/hooks/useFetchInfiniteFilteredRules/types';

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

interface ListRulesQueryParams extends Omit<
  UseFetchInfiniteFilteredRulesProps,
  'page'
> {
  rule_id?: string;
}

const parseFiltersFromParams = (
  params: URLSearchParams,
): UseFetchInfiniteFilteredRulesProps => {
  const searchParam = params.get('search');
  const search =
    searchParam === null || searchParam === '' ? undefined : searchParam;
  const severityParam = params.get('severity');
  const severity =
    severityParam === null || severityParam === '' ? undefined : severityParam;
  const sourceParam = params.get('source');
  const source =
    sourceParam === null || sourceParam === '' ? undefined : sourceParam;
  const sort_by = params.get('sort_by') ?? undefined;
  const sort_order = params.get('sort_order') ?? undefined;
  const per_pageParam = params.get('per_page');
  const per_page = per_pageParam ? parseInt(per_pageParam, 10) : undefined;
  return { search, severity, source, sort_by, sort_order, per_page };
};

const filtersToSearchString = (f: ListRulesQueryParams): string => {
  const params = new URLSearchParams();
  if (f.search) params.set('search', f.search);
  if (f.severity) params.set('severity', f.severity);
  if (f.sort_by) params.set('sort_by', f.sort_by);
  if (f.sort_order) params.set('sort_order', f.sort_order);
  if (f.per_page) params.set('per_page', String(f.per_page));
  if (f.rule_id) params.set('rule_id', f.rule_id);
  return params.toString();
};

const hasAnyFilters = (f: ListRulesQueryParams) =>
  f.severity !== undefined ||
  f.search !== undefined ||
  f.sort_by !== undefined ||
  f.sort_order !== undefined;

export interface ListRulesContextValue {
  data: RuleListResponse;
  filters: UseFetchInfiniteFilteredRulesProps;
  hasFilters: boolean;
  setFilters: (filters: UseFetchInfiniteFilteredRulesProps) => void;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => void;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement | null>;
  isFetchingNextPage: boolean;
  selectedRuleId: string | null;
  setSelectedRuleId: (rule_id: string | null) => void;
}

const DEFAULT_RULE_LIST_RESPONSE: RuleListResponse = {
  items: [] as RuleListResponse['items'],
  total: 0,
  page: 1,
  per_page: 10,
  total_pages: 0,
  next_page: null,
  prev_page: null,
};

const ListRulesContext = createContext<ListRulesContextValue | null>(null);

export interface ListRulesProviderProps {
  children: ReactNode;
  defaultFilters?: UseFetchInfiniteFilteredRulesProps;
}

export const ListRulesProvider = ({
  children,
  defaultFilters = {},
}: ListRulesProviderProps) => {
  const queryClient = useQueryClient();
  const [selectedRuleId, setSelectedRuleIdState] = useState<string | null>(
    null,
  );
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters = useMemo<UseFetchInfiniteFilteredRulesProps>(() => {
    const urlFilters = parseFiltersFromParams(searchParams);
    return hasAnyFilters(urlFilters) ? urlFilters : defaultFilters;
  }, [searchParams, defaultFilters]);

  useEffect(() => {
    const rule_id = searchParams.get('rule_id');
    startTransition(() =>
      setSelectedRuleIdState(rule_id && rule_id !== '' ? rule_id : null),
    );
  }, [searchParams]);

  const hasFilters = useMemo(() => hasAnyFilters(filters), [filters]);

  const {
    data = DEFAULT_RULE_LIST_RESPONSE,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredRules({
    search: filters.search,
    severity: filters.severity,
    sort_by: filters.sort_by,
    sort_order: filters.sort_order,
    per_page: filters.per_page,
  });

  const handleSetFilters = useCallback(
    (newFilters: UseFetchInfiniteFilteredRulesProps) => {
      void queryClient.cancelQueries({ queryKey: ['rules'] });

      const updated: ListRulesQueryParams = {
        ...filters,
        ...newFilters,
        rule_id: selectedRuleId ?? undefined,
      };
      const query = filtersToSearchString(updated);
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [queryClient, router, pathname, filters, selectedRuleId],
  );

  const handleSetSelectedRuleId = useCallback(
    (rule_id: string | null) => {
      setSelectedRuleIdState(rule_id);
      const query = filtersToSearchString({
        ...filters,
        rule_id: rule_id ?? '',
      });
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, filters],
  );

  const value = useMemo<ListRulesContextValue>(
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
      selectedRuleId,
      setSelectedRuleId: handleSetSelectedRuleId,
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
      selectedRuleId,
      handleSetSelectedRuleId,
    ],
  );

  return (
    <ListRulesContext.Provider value={value}>
      {children}
    </ListRulesContext.Provider>
  );
};

export const useListRulesContext = () => {
  const context = useContext(ListRulesContext);
  if (!context) {
    throw new Error(
      'useListRulesContext must be used within a ListRulesProvider',
    );
  }
  return context;
};
