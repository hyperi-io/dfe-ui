import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';

/** The detail carries `enabled` only, so the runner's stop comes from the list row. */
export const useHuntRunState = (hunt: THuntDetailResponse) => {
  const {
    data: { items },
  } = useListHuntsContext();
  const listed = items.find((item) => item.name === hunt.name);

  return {
    enabled: hunt.enabled,
    autoDisabledAt: listed?.auto_disabled_at,
    autoDisabledReason: listed?.auto_disabled_reason,
  };
};
