import { getNextPageToken, MAX_PAGE_SIZE } from '@/core/config/api/pagination';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useDebounce } from '@/core/hooks/useDebounce';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchInfiniteSchemaDetailColumns } from './api';
import {
  SchemaDetailColumnFilterField,
  UseFetchInfiniteFilteredSchemaDetailColumnsProps,
} from './types';

const TEXT_FILTER_DEBOUNCE_MS = 300;

const optionalTextFilterParam = (value: string) =>
  value === '' ? undefined : value;

/** useFetchInfiniteFilteredSchemas props */
/**
 * @param schema_path - The path of the schema to fetch the detail columns for.
 * @param version - The version of the schema to fetch the detail columns for.
 * @param search - The search query to filter the columns by name, type, use_case, expr and comment.
 * @param name - The name of the column to filter by.
 * @param type - The type of the column to filter by.
 * @param use_case - The use case of the column to filter by.
 * @param expr - The expr of the column to filter by.
 * @param comment - The comment of the column to filter by.
 * @param attribute - The attribute of the column to filter by.
 * @param page_size - The number of schemas to fetch per page.
 * @param fetch_all - Keep reading pages until `next_page_token` runs out. `data` stays null, and `isLoading` true, until the last page lands, and a failed page is an error rather than a short list.
 *
 * @returns A list of schema detail columns.
 */
export const useFetchInfiniteFilteredSchemaDetailColumns = ({
  schema_path,
  version,
  search,
  name,
  type,
  use_case,
  expr,
  comment,
  attribute,
  page_size = 10,
  fetch_all = false,
  enabled = true,
}: UseFetchInfiniteFilteredSchemaDetailColumnsProps) => {
  const searchableColumnsOptions: {
    label: string;
    value: SchemaDetailColumnFilterField;
  }[] = [
    { label: 'Name', value: 'name' },
    { label: 'Type', value: 'type' },
    { label: 'Attribute', value: 'attribute' },
    { label: 'Index Type', value: 'use_case' },
    { label: 'Expression (CTE)', value: 'expr' },
    { label: 'Comment', value: 'comment' },
  ];

  const [selectedSearchableColumns, setSelectedSearchableColumns] = useState<
    string[]
  >(searchableColumnsOptions.map((column) => column.value));

  const pageSize = fetch_all ? MAX_PAGE_SIZE : page_size;

  const debouncedSearch = useDebounce(search ?? '', TEXT_FILTER_DEBOUNCE_MS);
  const debouncedName = useDebounce(name ?? '', TEXT_FILTER_DEBOUNCE_MS);
  const debouncedType = useDebounce(type ?? '', TEXT_FILTER_DEBOUNCE_MS);
  const debouncedUseCase = useDebounce(use_case ?? '', TEXT_FILTER_DEBOUNCE_MS);
  const debouncedExpr = useDebounce(expr ?? '', TEXT_FILTER_DEBOUNCE_MS);
  const debouncedComment = useDebounce(comment ?? '', TEXT_FILTER_DEBOUNCE_MS);
  const debouncedAttribute = useDebounce(
    attribute ?? '',
    TEXT_FILTER_DEBOUNCE_MS,
  );

  const {
    data,
    isLoading,
    isError,
    isFetching,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    enabled: enabled && !!schema_path && !!version,
    queryKey: QUERY_KEYS.schemas.schemaDetail({
      schema_path,
      version,
      search: optionalTextFilterParam(debouncedSearch),
      name: optionalTextFilterParam(debouncedName),
      type: optionalTextFilterParam(debouncedType),
      use_case: optionalTextFilterParam(debouncedUseCase),
      expr: optionalTextFilterParam(debouncedExpr),
      comment: optionalTextFilterParam(debouncedComment),
      attribute: optionalTextFilterParam(debouncedAttribute),
      selectedSearchableColumns,
      page_size: pageSize,
    }),
    queryFn: async ({ pageParam, signal }) =>
      fetchInfiniteSchemaDetailColumns({
        pathParams: { schema_path: schema_path ?? '' },
        queryParams: {
          version: version ?? '',
          search: optionalTextFilterParam(debouncedSearch),
          name: optionalTextFilterParam(debouncedName),
          type: optionalTextFilterParam(debouncedType),
          use_case: optionalTextFilterParam(debouncedUseCase),
          expr: optionalTextFilterParam(debouncedExpr),
          comment: optionalTextFilterParam(debouncedComment),
          attribute: optionalTextFilterParam(debouncedAttribute),
          searchable_columns: selectedSearchableColumns,
          page_token: pageParam,
          page_size: pageSize,
        },
        signal,
      }),
    getNextPageParam: getNextPageToken,
    initialPageParam: undefined as string | undefined,
    // A whole-schema read never shows another version's columns while this one loads.
    placeholderData: fetch_all ? undefined : keepPreviousData,
  });

  const flattenedData = useMemo(() => {
    if (!data?.pages?.length) {
      return null;
    }

    return {
      ...data.pages[0],
      items: data.pages.flatMap((page) => page.items || []),
    };
  }, [data]);

  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const readingAllPages = fetch_all && !!hasNextPage && !isError;
  const readEnabled = enabled && !!schema_path && !!version;

  useEffect(() => {
    if (readEnabled && readingAllPages && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [readEnabled, readingAllPages, fetchNextPage, isFetchingNextPage]);

  const hasSelection = !!schema_path && !!version;
  const isIncomplete = fetch_all && !!hasNextPage;

  return {
    data: hasSelection && !isIncomplete ? flattenedData : null,
    searchableColumnsOptions,
    selectedSearchableColumns,
    setSelectedSearchableColumns,
    isLoading: isLoading || readingAllPages,
    isError,
    isFetching,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  };
};
