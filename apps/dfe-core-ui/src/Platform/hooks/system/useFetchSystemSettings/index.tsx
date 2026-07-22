import { useQuery } from '@tanstack/react-query';
import { fetchSystemSettingsApi } from './api';

export const SYSTEM_SETTINGS_QUERY_KEY = () => ['systemSettings'];

export const useFetchSystemSettings = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: SYSTEM_SETTINGS_QUERY_KEY(),
    queryFn: () => fetchSystemSettingsApi(),
  });

  return { data, isLoading, error };
};
