import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSourceFieldMap, fetchStandardFieldMap } from './api';

export const useFetchFieldMapDetail = ({
  standard,
  source,
}: {
  standard: string | null;
  source?: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.fieldMaps.source({ standard, source }),
    queryFn: () =>
      source
        ? fetchSourceFieldMap(standard ?? '', source ?? '')
        : fetchStandardFieldMap(standard ?? ''),
    enabled: !!standard,
  });
  return { data, isLoading, error };
};
