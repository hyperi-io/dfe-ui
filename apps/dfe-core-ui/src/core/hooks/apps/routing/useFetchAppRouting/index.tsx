import { useQuery } from '@tanstack/react-query';
import { fetchAppRoutingApi } from './api';

export const APP_ROUTING_QUERY_KEY = (service: string, instance: string) => [
  'app-routing',
  service,
  instance,
];

/**
 * What the source definitions compile to, against what the overlay carries.
 *
 * Routing is DERIVED, never hand-set, so this is read-only by design: a
 * difference is drift to be re-synced, not an edit to be kept. `absent` is
 * separate from `drift` because an absent block means the app is running on
 * its built-in defaults, ignoring every source rule ever defined.
 */
export const useFetchAppRouting = ({
  service,
  instance,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: APP_ROUTING_QUERY_KEY(service, instance),
    queryFn: () => fetchAppRoutingApi({ pathParams: { service, instance } }),
    enabled: !!service && !!instance && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
