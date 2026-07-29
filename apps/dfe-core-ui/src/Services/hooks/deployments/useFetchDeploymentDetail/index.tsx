import { useQuery } from '@tanstack/react-query';
import { fetchDeploymentDetail } from './api';

export const DEPLOYMENT_DETAIL_QUERY_KEY = (
  service?: string | null,
  instance?: string | null,
) => [
  'deployment',
  ...(service ? [service] : []),
  ...(instance ? [instance] : []),
];
export const useFetchDeploymentDetail = ({
  service,
  instance,
}: {
  service?: string | null;
  instance?: string | null;
}) => {
  const isQueryEnabled = !!service && !!instance;
  const { data, isLoading, error } = useQuery({
    queryKey: DEPLOYMENT_DETAIL_QUERY_KEY(service, instance),
    queryFn: () =>
      fetchDeploymentDetail({
        pathParams: { service: service ?? '', instance: instance ?? '' },
      }),
    enabled: isQueryEnabled,
  });

  return { data, isLoading, error };
};
