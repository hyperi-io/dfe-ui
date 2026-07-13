import { useQuery } from '@tanstack/react-query';
import { sourceVersion } from './api';

export const SOURCE_DETAIL_QUERY_KEY = (
  source_name: string | null,
  source_version: string | null = null,
) => [
  'source',
  ...(source_name ? [source_name] : []),
  ...(source_version ? [source_version] : []),
];

export const useFetchSourceDetail = ({
  source_name,
  source_version,
  queryEnabled = true,
}: {
  source_name: string | null;
  source_version: string | null;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: SOURCE_DETAIL_QUERY_KEY(source_name, source_version),
    queryFn: () =>
      sourceVersion({
        pathParams: { name: source_name ?? '', version: source_version ?? '' },
      }),
    enabled: !!source_name && queryEnabled,
  });
  return { data, isLoading, error };
};
