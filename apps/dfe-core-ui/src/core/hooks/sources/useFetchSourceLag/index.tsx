import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { fetchSourceLagApi } from './api';

/** How often the lag is read again while the flow is on screen. */
const LAG_REFRESH_MS = 30_000;

/**
 * The customer's own transform's lag on the source's landing topic.
 *
 * Asked for only where the transform is external, since no other source has a
 * group of the customer's to read. A broker the engine cannot reach answers with
 * a null lag and the reason, which the console shows rather than a zero.
 */
export const useFetchSourceLag = ({
  source,
  queryEnabled = true,
}: {
  source: string | null;
  queryEnabled?: boolean;
}) =>
  useQuery({
    queryKey: QUERY_KEYS.sources.sourceLag({ name: source }),
    queryFn: () => fetchSourceLagApi({ pathParams: { name: source ?? '' } }),
    enabled: !!source && queryEnabled,
    refetchInterval: LAG_REFRESH_MS,
  });
