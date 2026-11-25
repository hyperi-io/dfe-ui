import { REAUTH_HEADER } from '@/core/hooks/useReauth';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOidcProvider } from './api';
import {
  TOidcProviderUpdateRequestBody,
  TOidcProviderUpdateResponse,
} from './types';

interface UseUpdateOidcProviderProps {
  /** The re-auth grant the engine requires on this change, read when the request goes out. */
  reauth?: () => string | undefined;
  onSuccess?: (data: TOidcProviderUpdateResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}

export const useUpdateOidcProvider = ({
  reauth,
  name,
  onSuccess,
  onError,
}: UseUpdateOidcProviderProps) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (oidcProvider: TOidcProviderUpdateRequestBody) =>
      updateOidcProvider({
        headerParams: { [REAUTH_HEADER]: reauth?.() },
        body: oidcProvider,
        pathParams: { name: name },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.oidcProviders.provider({
          name,
        }),
      });

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.oidcProviders.default(),
      });

      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
