import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOidcProviderApi } from './api';
import {
  TCreateOidcProviderRequest,
  TCreateOidcProviderResponse,
} from './types';

interface UseCreateOidcProviderProps {
  /** The re-auth grant the engine requires on this change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: (data: TCreateOidcProviderResponse) => void;
  onError?: (error: Error) => void;
}

export const useCreateOidcProvider = ({
  reauth,
  onSuccess,
  onError,
}: UseCreateOidcProviderProps = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (provider: TCreateOidcProviderRequest) =>
      createOidcProviderApi({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        body: provider,
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.oidcProviders.default(),
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
