import { LIFECYCLE_QUERY_KEY } from '@/Platform/hooks/lifecycle/useFetchLifecycle';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLifecycleApi } from './api';
import {
  TActionTypeRequest,
  TActionTypeRequestBody,
  TUpdateLifecycleResponse,
} from './types';

export const ACTION_MAP: Record<
  'start' | 'pause' | 'stop',
  TActionTypeRequest
> = {
  start: 'running',
  pause: 'paused',
  stop: 'stopped',
};

export const useUpdateLifecycle = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TUpdateLifecycleResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: ({ name, action }: TActionTypeRequestBody) =>
      updateLifecycleApi({
        body: {
          state: ACTION_MAP[action],
        },
        pathParams: { name },
      }),
    onSuccess: (values) => {
      void queryClient.invalidateQueries({ queryKey: LIFECYCLE_QUERY_KEY() });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
