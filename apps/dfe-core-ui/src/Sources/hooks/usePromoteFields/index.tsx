import { SOURCE_DETAIL_QUERY_KEY } from '@/Sources/hooks/useFetchSourceDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promoteFields } from './api';
import { TPromoteFieldRequest, TPromoteFieldResponse } from './types';

export const usePromoteFields = ({
  source_name,
  source_version,
  onSuccess,
  onError,
}: {
  source_name: string;
  source_version: string;
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
