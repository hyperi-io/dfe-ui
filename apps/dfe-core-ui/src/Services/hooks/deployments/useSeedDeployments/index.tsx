import { DEPLOYMENTS_QUERY_KEY } from '@/Services/hooks/deployments/useFetchInfiniteFilteredDeployments';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { seedDeployments } from './api';
import { TSeedDeploymentsResponse } from './types';

interface UseSeedDeploymentsProps {
  onSuccess?: (data: TSeedDeploymentsResponse) => void;
  onError?: (error: Error) => void;
}

export const useSeedDeployments = ({
  onSuccess,
  onError,
}: UseSeedDeploymentsProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => {
      return seedDeployments();
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: DEPLOYMENTS_QUERY_KEY(),
      });
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
