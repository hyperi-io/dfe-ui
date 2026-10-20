import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchOrganisationDetail } from './api';

export const useFetchOrganisationDetail = ({
  org_name,
}: {
  org_name?: string | null;
}) => {
  const isQueryEnabled = !!org_name;
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.orgs.org({ name: org_name }),
    queryFn: () =>
      fetchOrganisationDetail({
        pathParams: { name: org_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
