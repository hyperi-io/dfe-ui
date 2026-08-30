/**
 * Why removing a node from each backing service costs data rather than capacity.
 *
 * Keyed by service so the engine's catalogue drives the list; a service with no
 * entry falls back to the generic reason rather than being silently allowed to
 * scale down.
 */
export const REPLICA_DECREASE_REASON: Record<string, string> = {
  kafka:
    'Every partition has to be moved off a broker before it is removed. Remove it first and the replicas or the availability living on it go with it.',
  clickhouse:
    'Removing a node drops a copy of the data, or the data itself where that node holds a shard.',
};

export const GENERIC_DECREASE_REASON =
  'This is a stateful service with data placed on each node, so removing one costs data rather than capacity.';

export const UNDECLARED_CAUTION =
  'Nothing declares this count today, so the deployed value comes from the chart or profile tier and the engine cannot see it. A number lower than that tier default is a scale-down this check cannot catch.';

export type ReplicaCheck = {
  /** Whether the UI may submit this change. */
  allowed: boolean;
  /** Why it was refused. Set only when `allowed` is false. */
  reason?: string;
  /** A hazard the check could not rule out. Set independently of `allowed`. */
  caution?: string;
};

/**
 * Whether a replica count may be changed to `next`, and why not.
 *
 * Up-only, and the client is where that is enforced: server-side up-only
 * enforcement is a separate piece of work that does not exist yet, so this
 * check must not be written as if a backstop were there to catch it.
 *
 * A decrease is refused rather than warned about because the cost is data, not
 * availability - see the per-service reasons above.
 */
export const checkReplicaChange = (
  service: string,
  current: number | null | undefined,
  next: number,
): ReplicaCheck => {
  if (!Number.isInteger(next) || next < 1) {
    return {
      allowed: false,
      reason: 'A replica count must be a whole number of at least 1.',
    };
  }

  // Undeclared: the tier default is invisible here, so a decrease cannot be
  // ruled out. Refusing every first declaration would be worse than saying so.
  if (current === null || current === undefined) {
    return { allowed: true, caution: UNDECLARED_CAUTION };
  }

  if (next < current) {
    return {
      allowed: false,
      reason: REPLICA_DECREASE_REASON[service] ?? GENERIC_DECREASE_REASON,
    };
  }

  return { allowed: true };
};
