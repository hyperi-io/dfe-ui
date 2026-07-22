import { useQuery } from '@tanstack/react-query';
import { fetchHelmFileVariablesApi } from './api';

export const HELM_FILE_VARIABLES_QUERY_KEY = ({
  name,
}: { name?: string } = {}) => ['helmFileVariables', ...(name ? [name] : [])];

export const useFetchHelmFileVariables = ({ name }: { name: string }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: HELM_FILE_VARIABLES_QUERY_KEY({ name }),
    queryFn: () =>
      fetchHelmFileVariablesApi({
        pathParams: { name },
      }),
  });

  return { data, isLoading, error };
};
