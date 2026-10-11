import { Drawer } from '@/core/components/Drawer';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import {
  SYNC_STATES,
  syncStateText,
} from '@/Settings/components/OidcProviderManagement/OidcSyncStatusTag';
import { useSyncOidcProviderGroups } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups';
import { TSyncOidcProviderGroupsResponse } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups/types';
import { IconArrowMergeAltRight } from '@repo/dfe-icons';
import { Button, Spin } from 'antd';
import { useState } from 'react';

const dataListTermStyle =
  'text-sm font-medium text-gray-500 dark:text-gray-400';
const descriptionStyle =
  'text-sm text-foreground-muted dark:text-dark-foreground-muted';

/** Only a sync that listed the directory has counts to report. */
const SyncCounts = ({
  result,
}: {
  result: TSyncOidcProviderGroupsResponse;
}) => (
  <dl className="grid grid-cols-2 gap-2">
    <dt className={dataListTermStyle}>Groups Created</dt>
    <dd>{result.created}</dd>
    <dt className={dataListTermStyle}>Groups Updated</dt>
    <dd>{result.updated}</dd>
    <dt className={dataListTermStyle}>Total</dt>
    <dd>{result.total}</dd>
    {result.status === 'partial' && (
      <>
        <dt className={dataListTermStyle}>Groups Skipped</dt>
        <dd>{result.groups_skipped}</dd>
      </>
    )}
  </dl>
);

const SyncResult = ({
  result,
}: {
  result: TSyncOidcProviderGroupsResponse;
}) => {
  // Keyed on status, never on the text of error or skipped (the engine's contract).
  const state = Object.hasOwn(SYNC_STATES, result.status)
    ? SYNC_STATES[result.status]
    : undefined;
  if (!state) {
    return (
      <NotificationCard title="Sync finished" description={result.status} />
    );
  }
  const reason = result.status === 'error' ? result.error : null;
  return (
    <>
      <NotificationCard
        type={state.notice}
        title={state.title}
        description={
          reason ? (
            <div className="flex flex-col gap-1">
              <p className={descriptionStyle}>{state.message}</p>
              <p className={descriptionStyle}>{reason}</p>
            </div>
          ) : (
            syncStateText(result.status)
          )
        }
      />
      {(result.status === 'ok' || result.status === 'partial') && (
        <SyncCounts result={result} />
      )}
    </>
  );
};

export const SyncOidcProviderGroupsDrawer = ({
  oidcProviderName,
}: {
  oidcProviderName: string;
}) => {
  const [open, setOpen] = useState(false);

  const {
    data,
    mutate: syncOidcProvider,
    isPending,
    error,
  } = useSyncOidcProviderGroups({
    name: oidcProviderName,
  });

  const handleSyncOidcProvider = () => {
    syncOidcProvider();
    setOpen(true);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.oidc_write}>
        <RbacProtected.Unrestricted>
          <Button
            type="text"
            icon={<IconArrowMergeAltRight />}
            onClick={handleSyncOidcProvider}
            loading={isPending}
            disabled={isPending}
          >
            Sync OIDC Provider Groups
          </Button>
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" icon={<IconArrowMergeAltRight />} disabled>
            Sync OIDC Provider Groups
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>
      <Drawer
        title="Sync OIDC Provider Groups"
        open={open}
        size="30%"
        destroyOnHidden
        onClose={() => setOpen(false)}
        footer={null}
        classNames={{
          body: 'flex flex-col gap-4',
        }}
      >
        {isPending && (
          <div className="flex items-center gap-2">
            <Spin size="small" />
            <span className={descriptionStyle}>Syncing groups</span>
          </div>
        )}

        {!isPending && data && <SyncResult result={data} />}

        {error && <FormNotification text={error.message} type="error" />}
      </Drawer>
    </>
  );
};
