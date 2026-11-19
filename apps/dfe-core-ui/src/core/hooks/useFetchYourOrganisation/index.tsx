import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchYourOrganisation } from './api';

/** The organisation the deployment names as its own, the one running it. */
export const useFetchYourOrganisation = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.system.organisation(),
    queryFn: () => fetchYourOrganisation(),
  });

  return { data, isLoading, error };
};
