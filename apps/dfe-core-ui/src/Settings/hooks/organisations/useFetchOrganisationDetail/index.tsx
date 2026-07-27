import { useQuery } from '@tanstack/react-query';
import { fetchOrganisationDetail } from './api';

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
      fetchOrganisationDetail({
        pathParams: { name: org_name ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
