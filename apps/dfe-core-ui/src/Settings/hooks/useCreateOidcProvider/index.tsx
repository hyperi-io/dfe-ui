import { QUERY_KEY_INFINITE_FILTERED_OIDC_PROVIDERS } from '@/Settings/hooks/useFetchInfiniteFilteredOidcProviders';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOidcProviderApi } from './api';
import {
  TCreateOidcProviderRequest,
  TCreateOidcProviderResponse,
} from './types';

interface UseCreateOidcProviderProps {
  onSuccess?: (data: TCreateOidcProviderResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateOidcProvider = ({
  onSuccess,
  onError,
}: UseCreateOidcProviderProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (provider: TCreateOidcProviderRequest) =>
      createOidcProviderApi({
        body: provider,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_INFINITE_FILTERED_OIDC_PROVIDERS(),
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
