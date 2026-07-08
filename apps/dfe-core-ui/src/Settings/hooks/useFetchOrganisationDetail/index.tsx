import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useQuery } from '@tanstack/react-query';

export const ORGANISATION_DETAIL_QUERY_KEY = (org_name?: string | null) => [
  'organisation',
  ...(org_name ? [org_name] : []),
];

export const useFetchOrganisationDetail = ({
  org_name,
}: {
  org_name?: string | null;
}) => {
  const isQueryEnabled = !!org_name;
  const { data, isLoading, error } = useQuery({
    queryKey: ORGANISATION_DETAIL_QUERY_KEY(org_name),
    queryFn: () =>
      apiClient.get(API_CONFIG.orgs.org, {
        pathParams: { name: org_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
