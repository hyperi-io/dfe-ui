import { QUERY_KEY_SETUP_STATUS } from '@/core/hooks/useFetchSetupStatus';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { retireAdmin } from './api';
import { TRetireAdminResponse } from './types';

interface UseRetireAdminProps {
  onSuccess?: (data: TRetireAdminResponse) => void;
  onError?: (error: Error) => void;
}

export const useRetireAdmin = ({
  onSuccess,
  onError,
}: UseRetireAdminProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => retireAdmin(),
    onSuccess: (data) => {
      // The response IS the new setup status, so the cache takes it directly
      // rather than round-tripping for a value we already hold.
      queryClient.setQueryData(QUERY_KEY_SETUP_STATUS(), data);
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return {
    data,
    mutate,
    isPending,
    error,
  };
};
