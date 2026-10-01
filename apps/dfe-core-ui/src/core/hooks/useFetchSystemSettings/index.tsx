import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSystemSettingsApi } from './api';

export const useFetchSystemSettings = ({
  queryEnabled = true,
}: {
  queryEnabled?: boolean;
} = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.system.settings(),
    queryFn: () => fetchSystemSettingsApi(),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
