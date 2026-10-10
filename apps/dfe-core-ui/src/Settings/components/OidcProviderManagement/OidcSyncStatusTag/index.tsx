import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconCircleDashed,
  IconCircleXFilled,
} from '@repo/dfe-icons';
import { Tag } from 'antd';

type TSyncState = 'ok' | 'partial' | 'error' | 'not_configured';

const ICON_CLASS = 'inline size-3';

const STATE_TAGS: Record<
  TSyncState,
  { label: string; color: string; icon: React.ReactNode }
> = {
  ok: {
    label: 'OK',
    color: 'green',
    icon: <IconCircleCheckFilled aria-hidden className={ICON_CLASS} />,
  },
  partial: {
    label: 'Partial',
    color: 'orange',
    icon: <IconAlertTriangleFilled aria-hidden className={ICON_CLASS} />,
  },
  error: {
    label: 'Failed',
    color: 'red',
    icon: <IconCircleXFilled aria-hidden className={ICON_CLASS} />,
  },
  not_configured: {
    label: 'Not configured',
    color: 'default',
    icon: <IconCircleDashed aria-hidden className={ICON_CLASS} />,
  },
};

/** The engine writes `partial: <n> of <m> groups skipped, <why>` for a sync that left groups behind. */
const PARTIAL_PREFIX = 'partial:';

const syncState = (status: string): TSyncState | undefined => {
  if (Object.hasOwn(STATE_TAGS, status)) return status as TSyncState;
  if (status.startsWith(PARTIAL_PREFIX)) return 'partial';
  return undefined;
};

/** What a partial sync left behind, from the status the engine wrote. Other states carry theirs in `sync_error`. */
export const syncStatusDetail = (status: string, syncError: string) => {
  if (syncError) return syncError;
  return syncState(status) === 'partial'
    ? status.slice(PARTIAL_PREFIX.length).trim()
    : '';
};

/** How the provider's last group sync ended. A status the engine adds later shows as written. */
export const OidcSyncStatusTag = ({ status }: { status: string }) => {
  if (!status) return null;
  const state = syncState(status);
  if (!state) {
    return <Tag className="m-0">{status}</Tag>;
  }
  const { label, color, icon } = STATE_TAGS[state];
  return (
    <Tag className="m-0" color={color} icon={icon}>
      {label}
    </Tag>
  );
};
