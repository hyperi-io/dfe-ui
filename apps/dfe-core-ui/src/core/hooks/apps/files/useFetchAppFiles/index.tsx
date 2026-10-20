import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchAppFilesApi } from './api';

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
    queryKey: QUERY_KEYS.apps.files({ service, instance, setName }),
    queryFn: () =>
      fetchAppFilesApi({
        pathParams: { service, instance, set_name: setName },
      }),
    enabled: !!service && !!instance && !!setName && queryEnabled,
    retry: false,
  });

  return { data, isLoading, error };
};
