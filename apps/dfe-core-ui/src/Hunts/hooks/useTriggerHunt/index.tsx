import { useMutation } from '@tanstack/react-query';
import { triggerHunt } from './api';
import { TTriggerRequest, TTriggerResponse } from './types';

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
    mutationFn: (triggerRequest: TTriggerRequest) =>
      triggerHunt({
        pathParams: { name },
        body: triggerRequest,
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
