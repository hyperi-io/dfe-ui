import { useMutation } from '@tanstack/react-query';
import { checkCel } from './api';
import type { TCheckCelRequest, TCheckCelResponse } from './types';

interface UseCheckCelProps {
  onSuccess?: (data: TCheckCelResponse) => void;
  onError?: (error: Error) => void;
}

export const useCheckCel = ({ onSuccess, onError }: UseCheckCelProps = {}) => {
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (rule: TCheckCelRequest) => checkCel({ body: rule }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error, reset };
};
