import { NotificationCard } from '@/core/components/NotificationCard';
import { TCompatWriteResponse } from '@/Sources/hooks/useFetchCompat/types';
import { IconAlertTriangle, IconCheck } from '@repo/dfe-icons';

type TIngestWrite = Pick<
  TCompatWriteResponse,
  'reload' | 'restart_required' | 'apps_sync_error'
>;

/**
 * What a saved order or binding did to the running apps.
 *
 * A rules-only change reaches the receiver where it stands. Anything else names
 * the command each app needs, and a deploy-repo write that did not follow is a
 * warning, because the saved change is not running yet.
 */
export const IngestWriteResult = ({
  result,
  savedWhat,
}: {
  result: TIngestWrite;
  savedWhat: string;
}) => {
  const restarts = result.restart_required ?? [];

  if (result.apps_sync_error) {
    return (
      <NotificationCard
        type="warning"
        icon={<IconAlertTriangle />}
        title={`${savedWhat} saved, but the apps did not follow`}
        description={result.apps_sync_error}
      />
    );
  }

  if (result.reload === 'restart' && restarts.length > 0) {
    return (
      <NotificationCard
        type="warning"
        icon={<IconAlertTriangle />}
        title={`${savedWhat} saved. These apps need a restart to read it`}
        description={
          <ul className="m-0 list-none p-0">
            {restarts.map((command) => (
              <li key={command} className="font-mono text-xs">
                {command}
              </li>
            ))}
          </ul>
        }
      />
    );
  }

  return (
    <NotificationCard
      type="success"
      icon={<IconCheck />}
      title={`${savedWhat} saved`}
      description="The receiver took the change without a restart."
    />
  );
};
