import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (oidcProvider: TOidcProviderUpdateRequestBody) =>
      updateOidcProvider({
        body: oidcProvider,
        pathParams: { name: name },
      }),
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
