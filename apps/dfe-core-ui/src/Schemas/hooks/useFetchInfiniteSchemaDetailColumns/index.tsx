import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useDebounce } from '@/core/hooks/useDebounce';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { UseFetchInfiniteFilteredSchemaDetailColumnsProps } from './types';

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
 * @param per_page - The number of schemas to fetch per page.
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
  per_page = 10,
}: UseFetchInfiniteFilteredSchemaDetailColumnsProps) => {
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
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    enabled: !!schema_path && !!version,
    queryKey: [
      'schema-detail-columns',
      schema_path,
      version,
      optionalTextFilterParam(debouncedSearch),
      optionalTextFilterParam(debouncedName),
      optionalTextFilterParam(debouncedType),
      optionalTextFilterParam(debouncedUseCase),
      optionalTextFilterParam(debouncedExpr),
      optionalTextFilterParam(debouncedComment),
      optionalTextFilterParam(debouncedAttribute),
      per_page,
    ],
    queryFn: async ({ pageParam = 1, signal }) =>
      apiClient.get(API_CONFIG.schemas.schemaDetail, {
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
          page: pageParam,
          per_page,
        },
        signal,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.version.columns.next_page;
      return nextPage != null && nextPage > 0 ? nextPage : undefined;
    },
    initialPageParam: 1,
    placeholderData: keepPreviousData,
  });

  const flattenedData = useMemo(() => {
    if (!data?.pages?.length) {
      return null;
    }

    const firstPage = data.pages[0];
    const allItems = data.pages.flatMap(
      (page) => page.version.columns.items || [],
    );
    return {
      ...firstPage,
      version: {
        ...firstPage.version,
        columns: {
          ...firstPage.version.columns,
          items: allItems,
        },
      },
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

  const hasSelection = !!schema_path && !!version;

  return {
    data: hasSelection ? flattenedData : null,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    loadMoreRef,
    isFetchingNextPage,
  };
};
