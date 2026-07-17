import { useQuery } from '@tanstack/react-query';
import { fetchRepositoryPreferencesApi } from './api';

export const REPOSITORY_PREFERENCES_QUERY_KEY = () => [
  'repository',
  'preferences',
];

export const useFetchRepositoryPreferences = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: REPOSITORY_PREFERENCES_QUERY_KEY(),
    queryFn: () => fetchRepositoryPreferencesApi(),
  });

  return { data, isLoading, error };
};
