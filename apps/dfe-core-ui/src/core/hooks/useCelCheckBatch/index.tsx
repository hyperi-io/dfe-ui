import { useMutation } from '@tanstack/react-query';
import { checkCelBatch } from './api';
import type { TCheckCelBatchRequest, TCheckCelBatchResponse } from './types';

interface UseCheckCelBatchProps {
  onSuccess?: (data: TCheckCelBatchResponse) => void;
  onError?: (error: Error) => void;
}

export const useCheckCelBatch = ({
  onSuccess,
  onError,
}: UseCheckCelBatchProps = {}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: TCheckCelBatchRequest) => checkCelBatch({ body: rule }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error, reset };
};
