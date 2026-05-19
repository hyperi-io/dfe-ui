import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const useFetchSchemaDetail = ({
  schema_path,
}: {
  schema_path: string;
  version?: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['schema', schema_path],
    queryFn: () =>
      apiClient.get(API_CONFIG.schemas.schema, {
        pathParams: { schema_path: schema_path ?? '' },
      }),
    enabled: !!schema_path,
  });
  return { data, isLoading, error };
};
