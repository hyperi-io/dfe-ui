'use client';

import { NotificationCard } from '@/core/components/NotificationCard';
import { ApiWriteConflict } from '@/core/config/api/client';
import { Button } from 'antd';

/** Revisions are commit SHAs, and only the leading characters are readable. */
const short = (revision: string) => revision.slice(0, 7);

/**
 * A write refused because the deploy repo moved after this page read it.
 *
 * Recoverable rather than fatal, so this offers the re-read instead of an error
 * message: the engine returns the revision to retry against, which is what the
 * reload refetches. The pending edit is left in the form, because the operator
 * still has to decide whether it survives contact with what landed.
 */
export const WriteConflictNotice = ({
  conflict,
  onReload,
  isReloading = false,
}: {
  conflict: ApiWriteConflict;
  onReload: () => void;
  isReloading?: boolean;
}) => (
  <NotificationCard
    type="warning"
    title="Someone else changed this first"
    description={
      <div className="flex flex-col gap-1">
        <p className="text-sm">
          {`Nothing was written. The deploy repo has moved on to ${short(
            conflict.head,
          )} since this page loaded, so saving now would overwrite a change you cannot see.`}
        </p>
        {conflict.current && (
          <p className="text-xs opacity-70">
            {`Your edit was based on ${short(conflict.current)}.`}
          </p>
        )}
      </div>
    }
    action={
      <Button size="small" onClick={onReload} loading={isReloading}>
        Reload latest
      </Button>
    }
  />
);
