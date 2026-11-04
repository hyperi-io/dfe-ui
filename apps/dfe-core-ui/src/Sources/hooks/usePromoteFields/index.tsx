import { sourcesQueries } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promoteFields } from './api';
import { TPromoteFieldRequest, TPromoteFieldResponse } from './types';

export const usePromoteFields = ({
  source_name,
  onSuccess,
  onError,
}: {
  source_name: string;
  onSuccess?: (data: TPromoteFieldResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({
      dry_run = true,
      ...fieldValues
    }: TPromoteFieldRequest & {
      dry_run?: boolean;
    }) =>
      promoteFields({
        pathParams: { source_name: source_name ?? '' },
        queryParams: { dry_run },
        body: fieldValues,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        ...sourcesQueries,
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error };
};
