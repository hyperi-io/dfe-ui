import { useQuery } from '@tanstack/react-query';
import { fetchHelmFilesApi } from './api';

export const HELM_FILES_QUERY_KEY = () => ['helmFiles'];

export const useFetchHelmFiles = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: HELM_FILES_QUERY_KEY(),
    queryFn: () => fetchHelmFilesApi(),
  });

  return { data, isLoading, error };
};
