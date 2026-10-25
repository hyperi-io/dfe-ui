import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reorderRuleBlocks } from './api';
import { TRuleOrderRequest, TRuleOrderResponse } from './types';

/**
 * Write one field's block order against the revision it was read at.
 *
 * The engine refuses a stale `etag` with 412 and a list that no longer names
 * the field's blocks with 409, so a refused write changes nothing and the
 * caller re-reads before trying again.
 */
export const useReorderRuleBlocks = ({
  etag,
  onSuccess,
}: {
  etag?: string | null;
  onSuccess?: (response: TRuleOrderResponse) => void;
} = {}) => {
  const queryClient = useQueryClient();
  const { mutate, isPending, error, reset, data } = useMutation({
    mutationFn: (body: TRuleOrderRequest) =>
      reorderRuleBlocks({ body, headerParams: { 'If-Match': etag } }),
    onSuccess: (response) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.ingest.rules(),
      });
      onSuccess?.(response);
    },
  });

  return { mutate, isPending, error, reset, data };
};
