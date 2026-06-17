'use client';

import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useLogout } from '@/core/hooks/useLogout';
import { IconLogout } from '@repo/dfe-icons';
import { Button, Spin } from 'antd';

const dataListTermStyle =
  'font-medium text-foreground/40 dark:text-dark-foreground/40';
const EmptyData = () => (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const UserActionsPopoverContent = () => {
  const { handleLogout } = useLogout();
  const { data: me, isLoading, error } = useAuthMe();

  return (
    <div className="flex min-w-48 flex-col gap-y-3">
      {isLoading && (
        <div className="flex justify-center py-1">
          <Spin size="small" />
        </div>
      )}
      {error && (
        <p className="text-foreground/50 dark:text-dark-foreground/50 text-sm">
          Could not load profile
        </p>
      )}
      {me && (
        <dl className="grid grid-cols-[80px_1fr] gap-x-6 gap-y-1 text-xs">
          <dt className={dataListTermStyle}>User ID:</dt>
          <dd>{me.user_id}</dd>
          <dt className={dataListTermStyle}>Org ID:</dt>
          <dd>{me.org_id}</dd>
          <dt className={dataListTermStyle}>Roles:</dt>
          <dd>
            {me?.roles?.length && me?.roles?.length > 0 ? (
              me.roles.join(', ')
            ) : (
              <EmptyData />
            )}
          </dd>
          <dt className={dataListTermStyle}>Permissions:</dt>
          <dd>
            {me?.permissions?.length && me?.permissions?.length > 0 ? (
              me.permissions.join(', ')
            ) : (
              <EmptyData />
            )}
          </dd>
          <dt className={dataListTermStyle}>Groups:</dt>
          <dd>
            {me?.groups?.length && me?.groups?.length > 0 ? (
              me.groups.join(', ')
            ) : (
              <EmptyData />
            )}
          </dd>
        </dl>
      )}
      <Button
        color="default"
        variant="outlined"
        icon={<IconLogout />}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </div>
  );
};
