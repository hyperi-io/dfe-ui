import { QUERY_KEY_SETUP_STATUS } from '@/core/hooks/useFetchSetupStatus';
import { SYSTEM_RETENTION_QUERY_KEY } from '@/Platform/hooks/system/useFetchRetention';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSystemRetentionApi } from './api';
import {
  TUpdateSystemRetentionRequest,
  TUpdateSystemRetentionResponse,
} from './types';

export const useUpdateRetention = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (values: TUpdateSystemRetentionResponse) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();

  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: (body: TUpdateSystemRetentionRequest) =>
      updateSystemRetentionApi({ body }),
    onSuccess: (values) => {
      onSuccess?.(values);
    },
    onError: (error) => {
      onError?.(error);
    },
    // A 502 has already committed the override, so the reads refresh on error too.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: SYSTEM_RETENTION_QUERY_KEY() });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY_SETUP_STATUS() });
    },
  });

  return { data, mutate, isPending, error, reset };
};
