import { useQuery } from '@tanstack/react-query';
import { fetchServiceDetail } from './api';

export const useFetchServiceDetail = ({
  service_name,
  service_instance,
}: {
  service_name: string | null;
  service_instance: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['service', service_name, service_instance],
    queryFn: () =>
      fetchServiceDetail(service_name ?? '', service_instance ?? ''),
    enabled: !!service_name && !!service_instance,
  });
  return { data, isLoading, error };
};
