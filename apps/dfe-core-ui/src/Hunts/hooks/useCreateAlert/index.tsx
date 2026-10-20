import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAlert } from './api';
import { TAlertCreateRequest, TAlertCreateResponse } from './types';

export const useCreateAlert = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: TAlertCreateResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error } = useMutation({
    // The engine ignores a written url_scheme, so the empty default is sent.
    mutationFn: (alert: TAlertCreateRequest) =>
      createAlert({ body: { ...alert, url_scheme: '' } }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.alerts.destinations(),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });
  return { data, mutate, isPending, error };
};
