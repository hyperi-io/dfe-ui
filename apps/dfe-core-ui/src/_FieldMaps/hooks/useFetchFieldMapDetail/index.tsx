import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchFieldMapDetail = ({
  standard,
  source,
}: {
  standard: string | null;
  source?: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['field-map', standard, source],
    queryFn: () =>
      source
        ? apiClient.get(API_CONFIG.fieldMaps.source, {
            pathParams: { standard: standard ?? '', source: source ?? '' },
          })
        : apiClient.get(API_CONFIG.fieldMaps.standard, {
            pathParams: { standard: standard ?? '' },
          }),
    enabled: !!standard,
  });
  return { data, isLoading, error };
};
