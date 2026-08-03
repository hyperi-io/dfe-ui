import { useQuery } from '@tanstack/react-query';
import { fetchDeploymentHistory } from './api';

export const QUERY_KEY_DEPLOYMENT_HISTORY = ({
  service_name,
  service_instance,
}: {
  service_name?: string | null;
  service_instance?: string | null;
} = {}) => [
  'deployment-history',
  ...(service_name ? [service_name] : []),
  ...(service_instance ? [service_instance] : []),
];

export const useFetchDeploymentHistory = ({
  service_name,
  service_instance,
}: {
  service_name: string | null;
  service_instance: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEY_DEPLOYMENT_HISTORY({
      service_name,
      service_instance,
    }),
    queryFn: () =>
      fetchDeploymentHistory(service_name ?? '', service_instance ?? ''),
    enabled: !!service_name && !!service_instance,
  });
  return { data, isLoading, error };
};
