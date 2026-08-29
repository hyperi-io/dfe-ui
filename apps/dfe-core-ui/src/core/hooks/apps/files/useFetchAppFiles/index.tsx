import { useQuery } from '@tanstack/react-query';
import { fetchAppFilesApi } from './api';

export const APP_FILES_QUERY_KEY = (
  service: string,
  instance: string,
  setName: string,
) => ['app-files', service, instance, setName];

/** Every file in one of the app's declared file sets, without their contents. */
export const useFetchAppFiles = ({
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
    queryKey: APP_FILES_QUERY_KEY(service, instance, setName),
    queryFn: () =>
      fetchAppFilesApi({
        pathParams: { service, instance, set_name: setName },
      }),
    enabled: !!service && !!instance && !!setName && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
