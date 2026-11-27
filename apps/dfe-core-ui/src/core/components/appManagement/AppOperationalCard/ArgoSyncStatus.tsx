import { NotificationCard } from '@/core/components/NotificationCard';
import { Tooltip } from '@/core/components/Tooltip';
import { TAppStatusResponse } from '@/core/hooks/apps/operations/useFetchAppStatus/types';
import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconCircleDashed,
  IconCircleXFilled,
  IconRefresh,
} from '@repo/dfe-icons';
import { Tag } from 'antd';

export type TArgoSync = NonNullable<TAppStatusResponse['sync']>;

const ICON_CLASS = 'inline size-3';
const TONE_ICONS: Record<string, React.ReactNode> = {
  green: <IconCircleCheckFilled aria-hidden className={ICON_CLASS} />,
  orange: <IconAlertTriangleFilled aria-hidden className={ICON_CLASS} />,
  red: <IconCircleXFilled aria-hidden className={ICON_CLASS} />,
  blue: <IconRefresh aria-hidden className={ICON_CLASS} />,
  default: <IconCircleDashed aria-hidden className={ICON_CLASS} />,
};

type TArgoLabel = { tone: string; label: string };

// Argo adds values over time, so a value not listed shows as Argo wrote it
const SYNC_LABELS: Record<string, TArgoLabel> = {
  Synced: { tone: 'green', label: 'Synced' },
  OutOfSync: { tone: 'orange', label: 'Out of sync' },
  Unknown: { tone: 'default', label: 'Sync unknown' },
};
const HEALTH_LABELS: Record<string, TArgoLabel> = {
  Healthy: { tone: 'green', label: 'Healthy' },
  Progressing: { tone: 'blue', label: 'Progressing' },
  Degraded: { tone: 'red', label: 'Degraded' },
  Suspended: { tone: 'default', label: 'Suspended' },
  Missing: { tone: 'orange', label: 'Missing' },
  Unknown: { tone: 'default', label: 'Health unknown' },
};

const ArgoTag = (props: {
  labels: Record<string, TArgoLabel>;
  status: string;
  hint: string;
}) => {
  const { tone, label } = props.labels[props.status] ?? {
    tone: 'default',
    label: props.status,
  };
  return (
    <Tooltip title={props.hint}>
      <Tag className="m-0" color={tone} icon={TONE_ICONS[tone]}>
        {label}
      </Tag>
    </Tooltip>
  );
};

// A git revision reads as its short sha, a chart version as written
const shortRevision = (revision: string) =>
  /^[0-9a-f]{40}$/.test(revision) ? revision.slice(0, 7) : revision;

// Argo's own UI reads a condition's kind from its name
const noticeType = (conditionType: string) => {
  if (conditionType.endsWith('Error')) return 'error';
  if (conditionType.endsWith('Warning')) return 'warning';
  return 'info';
};

/**
 * Argo CD's sync, health and conditions for the instance's Application. The
 * deploy repo write reports success before Argo reads it, so an Application
 * Argo refuses (a ComparisonError) only shows here.
 */
export const ArgoSyncStatus = ({ sync }: { sync?: TArgoSync | null }) => {
  if (!sync) return null;
  // Argo keeps the last health it saw on an Application it can't compare, so it says nothing about this one
  const refused =
    sync.status === 'Unknown' &&
    sync.conditions.some((condition) => condition.type.endsWith('Error'));
  const revision = sync.revision
    ? `revision ${shortRevision(sync.revision)}`
    : 'no revision yet';
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-foreground/60 dark:text-dark-foreground/60 text-sm">
          Argo CD
        </span>
        <ArgoTag
          labels={SYNC_LABELS}
          status={sync.status}
          hint={`Argo CD sync state, ${revision}`}
        />
        <ArgoTag
          labels={HEALTH_LABELS}
          status={refused ? 'Unknown' : sync.health.status}
          hint="Argo CD health"
        />
      </div>
      {sync.conditions.map((condition, index) => (
        <NotificationCard
          key={`${condition.type}-${index}`}
          type={noticeType(condition.type)}
          title={condition.type}
          description={condition.message || undefined}
          classNames={{ description: 'break-words' }}
        />
      ))}
    </>
  );
};
