import { useQuery } from '@tanstack/react-query';
import { fetchAppScalingApi } from './api';

export const APP_SCALING_QUERY_KEY = (service: string, instance: string) => [
  'app-scaling',
  service,
  instance,
];

/**
 * The scaling dials, or why they do not apply here.
 *
 * The endpoint answers with `supported: false` plus a reason off Kubernetes
 * rather than 404ing, so the caller renders the reason instead of a dead
 * control.
 */
export const useFetchAppScaling = ({
  service,
  instance,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: APP_SCALING_QUERY_KEY(service, instance),
    queryFn: () => fetchAppScalingApi({ pathParams: { service, instance } }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
