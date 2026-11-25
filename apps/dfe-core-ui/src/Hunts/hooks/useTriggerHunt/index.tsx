import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerHunt } from './api';
import { TTriggerResponse } from './types';

// The run is queued for the runner to claim; the engine takes no body. The
// hunt is read again at once, so its run state shows the queued run.
export const useTriggerHunt = ({
  onSuccess,
  onError,
  name,
}: {
  name: string;
  onSuccess?: (data: TTriggerResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: () =>
      triggerHunt({
        pathParams: { name },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hunts.hunt({ name }),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
