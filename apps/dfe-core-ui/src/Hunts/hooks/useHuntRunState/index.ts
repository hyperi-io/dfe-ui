import { useListHuntsContext } from '@/Hunts/contexts/ListHuntsContext';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';

/**
 * The runner's stop comes from the detail, and from the list row only for an
 * engine whose detail omits it, so a hunt outside the loaded page still shows it.
 */
export const useHuntRunState = (hunt: THuntDetailResponse) => {
  const {
    data: { items },
  } = useListHuntsContext();
  const detailHasStop = hunt.auto_disabled_at !== undefined;
  const listed = detailHasStop
    ? undefined
    : items.find((item) => item.name === hunt.name);

  return {
    enabled: hunt.enabled,
    autoDisabledAt: detailHasStop
      ? hunt.auto_disabled_at
      : listed?.auto_disabled_at,
    autoDisabledReason: detailHasStop
      ? hunt.auto_disabled_reason
      : listed?.auto_disabled_reason,
  };
};
