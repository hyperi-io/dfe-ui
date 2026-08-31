import { useQuery } from '@tanstack/react-query';
import { fetchAppFileApi } from './api';

export const APP_FILE_QUERY_KEY = (
  service: string,
  instance: string,
  setName: string,
  filename: string,
) => ['app-file', service, instance, setName, filename];

/** One authored file's content. */
export const useFetchAppFile = ({
  service,
  instance,
  setName,
  filename,
  queryEnabled = true,
}: {
  service: string;
  instance: string;
  setName: string;
  filename: string;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: APP_FILE_QUERY_KEY(service, instance, setName, filename),
    queryFn: () =>
      fetchAppFileApi({
        pathParams: { service, instance, set_name: setName, filename },
      }),
    enabled: !!service && !!instance && !!setName && !!filename && queryEnabled,
    retry: false,
  });

  // `data.etag` is the deploy repo revision to send back as If-Match on a write
  // to this file. `refetch` is how a refused write recovers.
  return { data, isLoading, isFetching, error, refetch };
};
