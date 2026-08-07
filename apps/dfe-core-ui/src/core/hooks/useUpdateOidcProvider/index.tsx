import { QUERY_KEY_INFINITE_FILTERED_OIDC_PROVIDERS } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders';
import { QUERY_KEY_OIDC_PROVIDER_DETAIL } from '@/core/hooks/useFetchOidcProviderDetail';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateOidcProvider } from './api';
import {
  TOidcProviderUpdateRequestBody,
  TOidcProviderUpdateResponse,
} from './types';

interface UseUpdateOidcProviderProps {
  onSuccess?: (data: TOidcProviderUpdateResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}

export const useUpdateOidcProvider = ({
  name,
  onSuccess,
  onError,
}: UseUpdateOidcProviderProps) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (oidcProvider: TOidcProviderUpdateRequestBody) =>
      updateOidcProvider({
        body: oidcProvider,
        pathParams: { name: name },
      }),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_OIDC_PROVIDER_DETAIL({
          name: name,
        }),
      });

      void queryClient.invalidateQueries({
        queryKey: QUERY_KEY_INFINITE_FILTERED_OIDC_PROVIDERS(),
      });

      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
