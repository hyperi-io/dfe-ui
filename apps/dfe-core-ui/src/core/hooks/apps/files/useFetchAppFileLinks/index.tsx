import { useQuery } from '@tanstack/react-query';
import { fetchAppFileLinksApi } from './api';

export const APP_FILE_LINKS_QUERY_KEY = (
  service: string,
  instance: string,
  setName: string,
) => ['app-file-links', service, instance, setName];

/**
 * Where each linked file came from, and whether it still matches.
 *
 * `drift` is a local edit over a linked file; `outdated` is the link's target
 * having moved on since it resolved. They call for different actions, so they
 * are reported apart.
 */
export const useFetchAppFileLinks = ({
  service,
  instance,
  setName,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  setName: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: APP_FILE_LINKS_QUERY_KEY(service, instance, setName),
    queryFn: () =>
      fetchAppFileLinksApi({
        pathParams: { service, instance, set_name: setName },
      }),
    enabled: !!service && !!instance && !!setName && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
