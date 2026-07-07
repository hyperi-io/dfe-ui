import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { PromoteFieldRequest, PromoteFieldResponse } from './types';

export const usePromoteFields = ({
  source_name,
  source_version,
  onSuccess,
  onError,
}: {
  source_name: string;
  source_version: string;
  onSuccess?: (data: PromoteFieldResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      dry_run = true,
      ...fieldValues
    }: PromoteFieldRequest & {
      dry_run?: boolean;
    }) =>
      apiClient.post(API_CONFIG.schemas.promoteField, {
        pathParams: { source_name: source_name ?? '' },
        queryParams: { dry_run },
        body: fieldValues,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: SOURCE_DETAIL_QUERY_KEY(source_name, source_version),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error };
};
