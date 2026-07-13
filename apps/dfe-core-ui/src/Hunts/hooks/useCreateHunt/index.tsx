import { useMutation } from '@tanstack/react-query';
import { createHunt } from './api';
import { THuntCreateRequest, THuntCreateResponse } from './types';

export const useCreateHunt = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: THuntCreateResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (hunt: THuntCreateRequest) => createHunt({ body: hunt }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
