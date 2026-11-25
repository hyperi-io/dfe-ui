import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { MAX_PAGE_SIZE } from '@/core/config/api/pagination';
import { fetchInfiniteFilteredHunts } from '@/core/hooks/useFetchInfiniteFilteredHunts/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/** The wait between reads of a queued or running hunt when no trigger told the runner's poll period. */
export const RUN_POLL_MS = 5000;

/** Where a trigger leaves the runner's poll period for the hunt, in seconds. */
export const huntPollSecondsKey = (name?: string | null) => [
  'hunt-run-poll-seconds',
  name ?? '',
];

/**
 * Milliseconds to the next read while a run is queued or running, false once it has landed.
 * The runner's poll period is how long a queued run can wait, so it sets the pace when known.
 */
export const runPollInterval = (
  run?: { running?: boolean; run_requested?: boolean } | null,
  pollSeconds?: number,
) => {
  if (!run?.running && !run?.run_requested) {
    return false;
  }
  return pollSeconds ? Math.max(1000, pollSeconds * 1000) : RUN_POLL_MS;
};

/**
 * The hunt's run state, which the engine reports on the hunts list and not on
 * the hunt's own detail. The list is searched for the hunt's name, so a hunt
 * outside the loaded list page still has its state. Its key sits under the
 * hunt's detail key, so refetching that hunt refetches this too.
 *
 * Polling stops on a failed read, because the last good data still says queued
 * and would keep a failing request going. A window focus, a remount or a trigger
 * reads again, so the page recovers without a reload.
 */
export const useFetchHuntRunState = ({ name }: { name?: string | null }) => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: [...QUERY_KEYS.hunts.hunt({ name }), 'run-state'],
    queryFn: async ({ signal }) => {
      const page = await fetchInfiniteFilteredHunts({
        queryParams: { search: name ?? undefined, page_size: MAX_PAGE_SIZE },
        signal,
      });
      return page.items.find((item) => item.name === name) ?? null;
    },
    enabled: !!name,
    refetchInterval: (query) =>
      query.state.status === 'error'
        ? false
        : runPollInterval(
            query.state.data,
            queryClient.getQueryData<number>(huntPollSecondsKey(name)),
          ),
  });

  return { run: data, isLoading, error };
};
