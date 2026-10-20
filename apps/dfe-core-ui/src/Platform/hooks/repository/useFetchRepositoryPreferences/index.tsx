import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchRepositoryPreferencesApi } from './api';

export const useFetchRepositoryPreferences = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.repository.preferences(),
    queryFn: () => fetchRepositoryPreferencesApi(),
  });

  return { data, isLoading, error };
};
