import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useAdministeredOrg } from '@/core/hooks/useAdministeredOrg';
import { useQuery } from '@tanstack/react-query';
import { fetchYourOrganisation } from './api';

/**
 * The organisation the deployment names as its own, the one running it.
 * An org admin cannot read it, so it is not asked for.
 */
export const useFetchYourOrganisation = () => {
  const administeredOrg = useAdministeredOrg();
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.system.organisation(),
    queryFn: () => fetchYourOrganisation(),
    enabled: !administeredOrg,
  });

  return { data, isLoading, error };
};
