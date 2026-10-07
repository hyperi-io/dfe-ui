import { Drawer } from '@/core/components/Drawer';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Tooltip } from '@/core/components/Tooltip';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { useSyncOidcProviderGroups } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups';
import { TSyncOidcProviderGroupsResponse } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups/types';
import { IconArrowMergeAltRight } from '@repo/dfe-icons';
import { Button, Spin } from 'antd';
import { useState } from 'react';

const dataListTermStyle =
  'text-sm font-medium text-gray-500 dark:text-gray-400';

// The engine syncs only an enabled provider in api mode, so the other cases are explained before the click.
const syncUnavailableReason = ({ enabled, groups }: TOidcProviderListItem) => {
  if (!enabled) {
    return 'This provider is disabled, so there is nothing to sync.';
  }
  if (groups.mode === 'token_claim') {
    return "Groups come from each login's token, so there is no directory to sync. Link a DFE group to an IdP group by its source ID.";
  }
  if (groups.mode === 'manual') {
    return 'Group membership is managed in DFE, so there is no directory to sync.';
  }
  return null;
};

const SyncResult = ({
  result,
}: {
  result: TSyncOidcProviderGroupsResponse;
}) => {
  if (result.skipped) {
    return (
      <NotificationCard
        title="Sync skipped"
        description={result.skipped}
        type="info"
      />
    );
  }

  if (result.error) {
    return (
      <NotificationCard
        title="Sync failed"
        description={result.error}
        type="error"
      />
    );
  }

  return (
    <dl className="grid grid-cols-2 gap-2">
      <dt className={dataListTermStyle}>Groups Created</dt>
      <dd>{result.created}</dd>
      <dt className={dataListTermStyle}>Groups Updated</dt>
      <dd>{result.updated}</dd>
      <dt className={dataListTermStyle}>Total</dt>
      <dd>{result.total}</dd>
      {result.groups_skipped > 0 && (
        <>
          <dt className={dataListTermStyle}>Groups Skipped</dt>
          <dd>{result.groups_skipped}</dd>
        </>
      )}
    </dl>
  );
};

export const SyncOidcProviderGroupsDrawer = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  const [open, setOpen] = useState(false);

  const {
    data,
    mutate: syncOidcProvider,
    isPending,
    error,
  } = useSyncOidcProviderGroups({
    name: oidcProvider.name,
  });

  const unavailableReason = syncUnavailableReason(oidcProvider);

  const handleSyncOidcProvider = () => {
    syncOidcProvider();
    setOpen(true);
  };

  return (
    <>
      <RbacProtected action={RbacProtected.rbacActions.oidc_write}>
        <RbacProtected.Unrestricted>
          {unavailableReason ? (
            <Tooltip title={unavailableReason}>
              <Button type="text" icon={<IconArrowMergeAltRight />} disabled>
                Sync OIDC Provider Groups
              </Button>
            </Tooltip>
          ) : (
            <Button
              type="text"
              icon={<IconArrowMergeAltRight />}
              onClick={handleSyncOidcProvider}
              loading={isPending}
              disabled={isPending}
            >
              Sync OIDC Provider Groups
            </Button>
          )}
        </RbacProtected.Unrestricted>
        <RbacProtected.Restricted tooltip={{ show: true }}>
          <Button type="text" icon={<IconArrowMergeAltRight />} disabled>
            Sync OIDC Provider Groups
          </Button>
        </RbacProtected.Restricted>
      </RbacProtected>
      <Drawer
        title="Sync OIDC Provider"
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
          <>
            <Spin />{' '}
            <p className="sr-only">Syncing {oidcProvider.name} groups</p>
          </>
        )}

        {data && <SyncResult result={data} />}

        {error && <FormNotification text={error.message} type="error" />}
      </Drawer>
    </>
  );
};
