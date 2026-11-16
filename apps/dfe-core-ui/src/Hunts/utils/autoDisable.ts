import { formatEpochSecondsLocal } from '@/core/helpers/date.helpers';
import type { THuntDetailResponse } from '@/Hunts/hooks/useFetchHuntDetail/types';

// The ClickHouse error codes the hunt runner counts as a resource limit.
const LIMITS: Record<string, string> = {
  '241': "ClickHouse's memory limit",
  '158': "ClickHouse's rows-to-read limit",
  '201': "ClickHouse's quota",
};

/** The API's reason code as words. The code itself stays in the API. */
export const describeAutoDisableLimit = (reason?: string | null): string => {
  const code = reason?.match(/^resource_limit:(\d+)$/)?.[1];
  if (!code) {
    return 'a ClickHouse resource limit';
  }
  return LIMITS[code] ?? `a ClickHouse resource limit (error ${code})`;
};

/** One sentence for the tag's tooltip, the detail's alert and the edit form's alert. */
export const autoDisableNotice = (at: number, reason?: string | null) =>
  `Auto-disabled by the hunt runner on ${formatEpochSecondsLocal(at)} after hitting ${describeAutoDisableLimit(reason)} repeatedly.`;

/** What the hunt does: on in its configuration and not auto-disabled. */
export const effectiveEnabled = (
  hunt: Pick<THuntDetailResponse, 'enabled' | 'auto_disabled_at'>,
): boolean => (hunt.enabled ?? true) && hunt.auto_disabled_at == null;
