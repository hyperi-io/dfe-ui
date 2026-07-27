import { useMutation } from '@tanstack/react-query';
import { updateOidcProviderGroups } from './api';
import { TSyncOidcProviderGroupsResponse } from './types';

interface UseSyncOidcProviderGroupsProps {
  onSuccess?: (data: TSyncOidcProviderGroupsResponse) => void;
  onError?: (error: Error) => void;
  name: string;
}

export const useSyncOidcProviderGroups = ({
  onSuccess,
  onError,
  name,
}: UseSyncOidcProviderGroupsProps) => {
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: () =>
      updateOidcProviderGroups({
        pathParams: { name },
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
