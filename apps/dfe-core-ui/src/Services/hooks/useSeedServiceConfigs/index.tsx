import { useMutation } from '@tanstack/react-query';
import { seedServiceConfigs } from './api';
import { TSeedServiceConfigsResponse } from './types';

interface UseSeedServiceConfigsProps {
  onSuccess?: (data: TSeedServiceConfigsResponse) => void;
  onError?: (error: Error) => void;
}

export const useSeedServiceConfigs = ({
  onSuccess,
  onError,
}: UseSeedServiceConfigsProps = {}) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => {
      return seedServiceConfigs();
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
