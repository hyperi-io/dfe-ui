import { ApiErrorNotification } from '@/core/components/ApiErrorNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import {
  getOrderConflict,
  getStaleRevision,
  isMissingRevision,
} from '@/Sources/utils/ingestErrors';
import { IconAlertTriangle } from '@repo/dfe-icons';
import { Button } from 'antd';

const ReloadButton = ({
  onReload,
  isReloading,
}: {
  onReload: () => void;
  isReloading: boolean;
}) => (
  <Button size="small" onClick={onReload} loading={isReloading}>
    Reload
  </Button>
);

/**
 * Why a guarded ingest write was refused, and the re-read that recovers it.
 *
 * Nothing is written on any of these, so each offers the reload rather than a
 * retry of the same body: the stale list or revision would be refused again.
 */
export const IngestWriteRefusal = ({
  error,
  sentIds = [],
  nameOf = (id) => id,
  onReload,
  isReloading = false,
}: {
  error: unknown;
  /** The ids the refused reorder named, to say which blocks moved under it. */
  sentIds?: string[];
  /** A block id as the list names it. */
  nameOf?: (id: string) => string;
  onReload: () => void;
  isReloading?: boolean;
}) => {
  const conflict = getOrderConflict(error);
  if (conflict) {
    const added = conflict.blocks
      .filter((id) => !sentIds.includes(id))
      .map(nameOf);
    const gone = sentIds
      .filter((id) => !conflict.blocks.includes(id))
      .map(nameOf);
    return (
      <NotificationCard
        type="warning"
        icon={<IconAlertTriangle />}
        title="The blocks changed since this page loaded"
        description={
          <div className="flex flex-col gap-1 text-sm">
            <p className="m-0">
              Nothing was written. Reload to see the blocks as they are now,
              then make your move again.
            </p>
            {added.length > 0 && (
              <p className="m-0">{`Added since: ${added.join(', ')}`}</p>
            )}
            {gone.length > 0 && (
              <p className="m-0">{`Gone since: ${gone.join(', ')}`}</p>
            )}
          </div>
        }
        action={<ReloadButton onReload={onReload} isReloading={isReloading} />}
      />
    );
  }

  if (getStaleRevision(error)) {
    return (
      <NotificationCard
        type="warning"
        icon={<IconAlertTriangle />}
        title="Someone else changed this first"
        description="Nothing was written. Reload to see their change, then make yours again."
        action={<ReloadButton onReload={onReload} isReloading={isReloading} />}
      />
    );
  }

  if (isMissingRevision(error)) {
    return (
      <NotificationCard
        type="error"
        icon={<IconAlertTriangle />}
        title="The engine asked for the revision this page read"
        description="Nothing was written. Reload so the save carries it."
        action={<ReloadButton onReload={onReload} isReloading={isReloading} />}
      />
    );
  }

  return <ApiErrorNotification error={error} />;
};
