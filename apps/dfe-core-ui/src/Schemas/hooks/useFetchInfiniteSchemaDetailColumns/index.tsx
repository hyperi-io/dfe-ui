import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
import { UseFetchInfiniteFilteredSchemaDetailColumnsProps } from './types';

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
export const useFetchInfiniteFilteredSchemaDetailColumns = (
  {
    schema_path,
    version,
    search,
    name,
    type,
    use_case,
    expr,
    comment,
    attribute,
    per_page,
  }: UseFetchInfiniteFilteredSchemaDetailColumnsProps = {
    schema_path: '',
    version: '',
    per_page: 10,
  },
) => {
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
    queryKey: [
      'schema-detail-columns',
      schema_path,
      version,
      search,
      name,
      type,
      use_case,
      expr,
      comment,
      attribute,
      per_page,
    ],
    queryFn: async ({ pageParam = 1, signal }) =>
      apiClient.get(API_CONFIG.schemas.schemaDetail, {
        pathParams: { schema_path: schema_path ?? '' },
        queryParams: {
          version: version ?? '',
          search: search,
          name: name,
          type: type,
          use_case: use_case,
          expr: expr,
          comment: comment,
          attribute: attribute,
          page: pageParam,
          per_page,
        },
        signal,
      }),
    getNextPageParam: (lastPage, allPages) => {
      const pageSize = per_page ?? lastPage.version.columns.per_page;
      const hasMore =
        lastPage.version.columns.items &&
        pageSize > 0 &&
        lastPage.version.columns.items.length >= pageSize;
      return hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const flattenedData = useMemo(() => {
    if (!data?.pages?.length) {
      return {
        items: [],
        schema_objects: {},
        total: 0,
        page: 1,
        per_page: per_page ?? 10,
        total_pages: 0,
        next_page: null as number | null,
        prev_page: null as number | null,
      };
    }

    const allItems = data.pages.flatMap(
      (page) => page.version.columns.items || [],
    );
    return {
      ...data.pages[0],
      items: allItems,
    };
  }, [data, per_page]);

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

  return {
    data: flattenedData,
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
