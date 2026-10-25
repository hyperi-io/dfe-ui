import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import {
  TCompatSetting,
  TCompatWriteResponse,
} from '@/Sources/hooks/useFetchCompat/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyCompat } from './api';

/**
 * Write the deployment's profile bindings against the revision they were read at.
 *
 * Binding a profile adds its block to the rule order, so the blocks are
 * re-read as well as the bindings.
 */
export const useApplyCompat = ({
  etag,
  onSuccess,
}: {
  etag?: string | null;
  onSuccess?: (response: TCompatWriteResponse) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset, data } = useMutation({
    mutationFn: (body: TCompatSetting) =>
      applyCompat({ body, headerParams: { 'If-Match': etag } }),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ingest.compat(),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ingest.rules(),
      });
      onSuccess?.(response);
    },
  });

  return { mutate, isPending, error, reset, data };
};
