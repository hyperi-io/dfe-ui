import { apiClient } from '@/core/config/api';
import { API_CONFIG } from '@/core/config/api/endpoints';
import { useMutation } from '@tanstack/react-query';
import { PromoteFieldRequest, PromoteFieldResponse } from './types';

export const usePromoteFields = ({
  source_name,
  onSuccess,
  onError,
}: {
  source_name: string;
  onSuccess?: (data: PromoteFieldResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      dry_run = true,
      ...fieldValues
    }: PromoteFieldRequest & {
      dry_run?: boolean;
    }) =>
      apiClient.post(API_CONFIG.schemas.promoteField, {
        pathParams: { source_name: source_name ?? '' },
        queryParams: { dry_run: dry_run },
        body: fieldValues,
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error };
};
