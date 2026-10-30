import { ApiError } from '@/core/config/api/client';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSourceFlowApi } from './api';

/**
 * The stages a source's records travel, resolved against this deployment.
 *
 * The engine's resolver is what the compilers write from, so reading it here is
 * what keeps the drawing and the deployed config one answer rather than two.
 *
 * A flow that cannot run is a 422 whose message names the stage that refused;
 * it is returned as `refusal` rather than an error state, because it is the
 * answer the console shows beside the choice that caused it.
 */
export const useFetchSourceFlow = ({
  source,
  queryEnabled = true,
}: {
  source: string | null;
  queryEnabled?: boolean;
}) => {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.sources.sourceFlow({ name: source }),
    queryFn: () => fetchSourceFlowApi({ pathParams: { name: source ?? '' } }),
    enabled: !!source && queryEnabled,
  });

  const refusal =
    error instanceof ApiError && error.status === 422 ? error.message : null;

  return { data, isLoading, refusal, error: refusal ? null : error };
};
