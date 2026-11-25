import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { MAX_PAGE_SIZE } from '@/core/config/api/pagination';
import { fetchInfiniteFilteredHunts } from '@/core/hooks/useFetchInfiniteFilteredHunts/api';
import { useQuery } from '@tanstack/react-query';

/** How often a queued or running hunt is read again, until its run lands. */
export const RUN_POLL_MS = 5000;

/** Milliseconds to the next read while a run is queued or running, false once it has landed. */
export const runPollInterval = (
  run?: { running?: boolean; run_requested?: boolean } | null,
) => (run?.running || run?.run_requested ? RUN_POLL_MS : false);

/**
 * The hunt's run state, which the engine reports on the hunts list and not on
 * the hunt's own detail. The list is searched for the hunt's name, so a hunt
 * outside the loaded list page still has its state. Its key sits under the
 * hunt's detail key, so refetching that hunt refetches this too.
 */
export const useFetchHuntRunState = ({ name }: { name?: string | null }) => {
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
    refetchInterval: (query) => runPollInterval(query.state.data),
  });

  return { run: data, isLoading, error };
};
