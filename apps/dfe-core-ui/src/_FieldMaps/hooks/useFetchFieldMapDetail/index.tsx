import { fetchSourceFieldMap, fetchStandardFieldMap } from './api';
import { useQuery } from '@tanstack/react-query';

export const useFetchFieldMapDetail = ({
  standard,
  source,
}: {
  standard: string | null;
  source?: string | null;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['field-map', standard, source],
    queryFn: () =>
      source
        ? fetchSourceFieldMap(standard ?? '', source ?? '')
        : fetchStandardFieldMap(standard ?? ''),
    enabled: !!standard,
  });
  return { data, isLoading, error };
};
