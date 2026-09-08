import { useMutation } from '@tanstack/react-query';
import { triggerHunt } from './api';
import { TTriggerResponse } from './types';

// The run is queued for the runner to claim; the engine takes no body.
export const useTriggerHunt = ({
  onSuccess,
  onError,
  name,
}: {
  name: string;
  onSuccess?: (data: TTriggerResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: () =>
      triggerHunt({
        pathParams: { name },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
