import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { huntPollSecondsKey } from '@/Hunts/hooks/useFetchHuntRunState';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { triggerHunt } from './api';
import { TTriggerResponse } from './types';

const HUNT_KEY_ROOT = QUERY_KEYS.hunts.hunt()[0];
const HUNT_KEY_NAME_SLOT = QUERY_KEYS.hunts.hunt()[1];

/** A query keyed under `['hunts', '{name}', ...]` that names this hunt, whatever else its key holds. */
const isHuntQuery = (key: readonly unknown[], name: string) =>
  key[0] === HUNT_KEY_ROOT &&
  key[1] === HUNT_KEY_NAME_SLOT &&
  key.includes(name);

// The run is queued for the runner to claim and the engine takes no body. Every
// query about the hunt is read again at once, so the queued run shows, and the
// runner's poll period is kept for the run state's polling.
export const useTriggerHunt = ({
  onSuccess,
  onError,
  name,
}: {
  name: string;
  onSuccess?: (data: TTriggerResponse) => void;
  onError?: (error: Error) => void;
}) => {
  const queryClient = useQueryClient();
  const { data, mutate, isPending, error, reset } = useMutation({
    mutationFn: () =>
      triggerHunt({
        pathParams: { name },
      }),
    onSuccess: (data) => {
      queryClient.setQueryData(huntPollSecondsKey(name), data.poll_seconds);
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.hunts.default(),
        predicate: (query) => isHuntQuery(query.queryKey, name),
      });
      onSuccess?.(data);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  return { data, mutate, isPending, error, reset };
};
