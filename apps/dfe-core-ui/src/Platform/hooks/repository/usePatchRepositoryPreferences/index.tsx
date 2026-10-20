import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRepositoryPreferencesApi } from './api';
import {
  TRepositoryPreferencesRequest,
  TRepositoryPreferencesResponse,
} from './types';

export const usePatchRepositoryPreferences = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TRepositoryPreferencesResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    mutationFn: (body: TRepositoryPreferencesRequest) =>
      updateRepositoryPreferencesApi({ body }),
    onSuccess: (values) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.repository.preferences(),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.repository.preferences(),
      });
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error };
};
