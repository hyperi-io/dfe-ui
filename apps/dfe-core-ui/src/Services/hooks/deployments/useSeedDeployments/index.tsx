import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => {
      return seedDeployments();
    },
    onSuccess: (data) => {
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
