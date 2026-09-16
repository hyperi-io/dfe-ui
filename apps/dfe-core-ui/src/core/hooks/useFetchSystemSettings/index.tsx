import { useQuery } from '@tanstack/react-query';
import { fetchSystemSettingsApi } from './api';

export const SYSTEM_SETTINGS_QUERY_KEY = () => ['systemSettings'];

export const useFetchSystemSettings = ({
  queryEnabled = true,
}: {
  queryEnabled?: boolean;
} = {}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: SYSTEM_SETTINGS_QUERY_KEY(),
    queryFn: () => fetchSystemSettingsApi(),
    enabled: queryEnabled,
  });

  return { data, isLoading, error };
};
