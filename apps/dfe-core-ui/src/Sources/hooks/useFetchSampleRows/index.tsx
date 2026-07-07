import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const SAMPLE_ROWS_QUERY_KEY = (source_name: string, version: string) => [
  'sample-rows',
  source_name,
  version,
];
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
    queryKey: SAMPLE_ROWS_QUERY_KEY(source_name, version),
    queryFn: () =>
      apiClient.get(API_CONFIG.schemas.sampleRows, {
        pathParams: { source_name },
        queryParams: { version },
      }),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
