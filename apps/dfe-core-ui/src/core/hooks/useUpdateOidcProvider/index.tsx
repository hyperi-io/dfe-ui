import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
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

  return { data, mutate, isPending, error };
};
