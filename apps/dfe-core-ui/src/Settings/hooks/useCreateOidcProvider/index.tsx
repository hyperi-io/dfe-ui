import { useMutation } from '@tanstack/react-query';
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
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (provider: TCreateOidcProviderRequest) =>
      createOidcProviderApi({
        body: provider,
      }),
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
