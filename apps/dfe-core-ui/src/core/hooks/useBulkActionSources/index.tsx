import { sourcesQueries } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkActionSources } from './api';
import {
  TBulkActionSourcesRequestBody,
  TBulkActionSourcesResponse,
} from './types';

interface UseBulkActionSourcesProps {
  onSuccess?: (data: TBulkActionSourcesResponse) => void;
  onError?: (error: Error) => void;
}

export const useBulkActionSources = ({
  onSuccess,
  onError,
}: UseBulkActionSourcesProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TBulkActionSourcesRequestBody) =>
      bulkActionSources({
        body,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        ...sourcesQueries,
      });

      void queryClient.invalidateQueries({
        ...sourcesQueries,
      });

      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
