import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSystemDefaultsApi } from './api';
import {
  TUpdateSystemDefaultsRequest,
  TUpdateSystemDefaultsResponse,
} from './types';

export const useUpdateSystemDefaults = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TUpdateSystemDefaultsResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TUpdateSystemDefaultsRequest) =>
      updateSystemDefaultsApi({
        body,
      }),
    onSuccess: (values) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.system.defaults(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.system.settings(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
