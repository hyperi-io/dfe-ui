import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { sampleRows } from './api';

/**
 * useFetchSampleRows
 * @param source_name source pathname
 * @param version source version
 * @returns SampleRows
 * {
 *  source_name: string;
 *  table: string;
 *  match_field?: string | null;
 *  match_value?: string | null;
 *  columns: string[];
 *  rows: {
 *    [key: string]: unknown;
 *  }[];
 *  } | undefined
 */
export const useFetchSampleRows = ({
  source_name,
  version,
  queryEnabled = true,
}: {
  source_name: string;
  version: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.schemas.sampleRows({ source_name, version }),
    queryFn: () =>
      sampleRows({
        pathParams: { source_name },
        queryParams: { version },
      }),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
