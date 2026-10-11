import { TSyncOidcProviderGroupsResponse } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups/types';
import {
  IconAlertTriangleFilled,
  IconCircleCheckFilled,
  IconCircleDashed,
  IconCircleMinus,
  IconCircleXFilled,
  IconUserCircle,
} from '@repo/dfe-icons';
import { Tag } from 'antd';

/** How a group sync ended: a sync's `status`, and what a provider's `last_sync_status` names. */
export type TSyncState = TSyncOidcProviderGroupsResponse['status'];

const ICON_CLASS = 'inline size-3';

type TSyncStateCopy = {
  /** The tag text. */
  label: string;
  color: string;
  icon: React.ReactNode;
  /** The heading over a manual sync's result. */
  title: string;
  /** What happened. */
  message: string;
  /** What the operator does about it, where there is anything to do. */
  nextStep?: string;
  notice: 'success' | 'warning' | 'error' | 'info' | 'default';
};

export const SYNC_STATES: Record<TSyncState, TSyncStateCopy> = {
  ok: {
    label: 'OK',
    color: 'green',
    icon: <IconCircleCheckFilled aria-hidden className={ICON_CLASS} />,
    title: 'Sync complete',
    message: 'Every directory group synced.',
    notice: 'success',
  },
  partial: {
    label: 'Partial',
    color: 'orange',
    icon: <IconAlertTriangleFilled aria-hidden className={ICON_CLASS} />,
    title: 'Sync partly complete',
    message: 'Some directory groups were skipped and the rest synced.',
    nextStep: 'The provider details say why each was skipped.',
    notice: 'warning',
  },
  error: {
    label: 'Failed',
    color: 'red',
    icon: <IconCircleXFilled aria-hidden className={ICON_CLASS} />,
    title: 'Sync failed',
    message: 'No groups changed.',
    notice: 'error',
  },
  not_configured: {
    label: 'Not configured',
    color: 'default',
    icon: <IconCircleDashed aria-hidden className={ICON_CLASS} />,
    title: 'Sync not run',
    message: 'The provider has no directory credential.',
    nextStep: 'Edit the provider to add one, then sync again.',
    notice: 'warning',
  },
  user_token: {
    label: 'Read at login',
    color: 'blue',
    icon: <IconUserCircle aria-hidden className={ICON_CLASS} />,
    title: 'No sync needed',
    message:
      "Each user's groups are read from their own token when they log in, so there is no directory to sync.",
    notice: 'info',
  },
  skipped: {
    label: 'Skipped',
    color: 'default',
    icon: <IconCircleMinus aria-hidden className={ICON_CLASS} />,
    title: 'Sync skipped',
    message: 'The provider is disabled, or its group Mode is not API.',
    nextStep: 'To sync, enable it and set Mode to API.',
    notice: 'default',
  },
};

/** What happened and, where there is one, the next step, as one line. */
export const syncStateText = (state: TSyncState) => {
  const { message, nextStep } = SYNC_STATES[state];
  return nextStep ? `${message} ${nextStep}` : message;
};

/** The engine writes `partial: <n> of <m> groups skipped, <why>` for a sync that left groups behind. */
const PARTIAL_PREFIX = 'partial:';

const syncState = (status: string): TSyncState | undefined => {
  if (Object.hasOwn(SYNC_STATES, status)) return status as TSyncState;
  if (status.startsWith(PARTIAL_PREFIX)) return 'partial';
  return undefined;
};

/** What to say under a provider's last sync: `sync_error` only for a failed sync, and nothing for a status the engine adds later. */
export const syncStatusDetail = (status: string, syncError: string) => {
  const state = syncState(status);
  if (state === undefined) return '';
  if (state === 'error') return syncError || SYNC_STATES.error.message;
  if (state === 'partial') {
    return (
      status.slice(PARTIAL_PREFIX.length).trim() || SYNC_STATES.partial.message
    );
  }
  return syncStateText(state);
};

/** How the provider's last group sync ended. A status the engine adds later shows as written. */
export const OidcSyncStatusTag = ({ status }: { status: string }) => {
  if (!status) return null;
  const state = syncState(status);
  if (!state) {
    return <Tag className="m-0">{status}</Tag>;
  }
  const { label, color, icon } = SYNC_STATES[state];
  return (
    <Tag className="m-0" color={color} icon={icon}>
      {label}
    </Tag>
  );
};
