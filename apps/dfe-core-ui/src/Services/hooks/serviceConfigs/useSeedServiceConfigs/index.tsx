import { QUERY_KEY_SERVICE_CONFIGS } from '@/Services/hooks/serviceConfigs/useFetchInfiniteFilteredServiceConfigs';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () => {
      return seedServiceConfigs();
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_SERVICE_CONFIGS(),
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
