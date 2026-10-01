import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyDefaults } from './api';
import { TApplyDefaultsRequestBody, TApplyDefaultsResponse } from './types';

interface UseApplyDefaultsProps {
  onSuccess?: (data: TApplyDefaultsResponse) => void;
  onError?: (error: Error) => void;
}

export const useApplyDefaults = ({
  onSuccess,
  onError,
}: UseApplyDefaultsProps = {}) => {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TApplyDefaultsRequestBody) => applyDefaults({ body }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.system.defaultsDrift(),
      });

      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    mutate,
    isPending,
    error,
    reset,
  };
};
