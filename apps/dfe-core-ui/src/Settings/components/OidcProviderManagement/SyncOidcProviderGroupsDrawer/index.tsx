import { Drawer } from '@/core/components/Drawer';
import { FormNotification } from '@/core/components/FormNotification';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useSyncOidcProviderGroups } from '@/Settings/hooks/oidcProviders/useSyncOidcProviderGroups';
import { IconArrowMergeAltRight } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

const dataListTermStyle =
  'text-sm font-medium text-gray-500 dark:text-gray-400';

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
      </RbacProtected>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Button type="text" icon={<IconArrowMergeAltRight />} disabled>
          Sync OIDC Provider Groups Response
        </Button>
      </RbacProtected.Restricted>
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
        <dl className="grid grid-cols-2 gap-2">
          <dt className={dataListTermStyle}>Groups Created</dt>
          <dd>{data?.created}</dd>
          <dt className={dataListTermStyle}>Groups Updated</dt>
          <dd>{data?.updated}</dd>
          <dt className={dataListTermStyle}>Total</dt>
          <dd>{data?.total}</dd>
        </dl>

        {data?.error && (
          <NotificationCard
            title="Error"
            description={data.error}
            type="error"
          />
        )}

        {error && <FormNotification text={error.message} type="error" />}
      </Drawer>
    </>
  );
};
