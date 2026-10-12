import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Table } from '@/core/components/Table';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { renderColumns } from '@/Settings/helpers/accountManagementHelpers';
import { useFetchInfiniteFilteredAccounts } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts';
import { TAccountsItemSummary } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';
import { useCallback } from 'react';

export const ViewOidcUserAccounts = ({
  oidcProviderId,
}: {
  oidcProviderId: string;
}) => {
  const {
    data: { items: accounts = [] },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useFetchInfiniteFilteredAccounts({
    oidc_id: oidcProviderId,
    blocked: false,
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 350,
  });

  // The engine names its own bootstrap admin, so a renamed one is still marked.
  const { data: setupStatus } = useFetchSetupStatus();
  const isRetiredAdmin = (account: TAccountsItemSummary) =>
    Boolean(setupStatus?.admin_retired) &&
    account.username === setupStatus?.admin_username;

  const columns = renderColumns({ isRetiredAdmin, renderActions: false });
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const el = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (!hasNextPage || isFetchingNextPage) return;

      // Fetch data when user is near the bottom
      if (scrollHeight - scrollTop - clientHeight < 40) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  return (
    <RbacProtected action={RbacProtected.rbacActions.account_read}>
      <RbacProtected.Unrestricted>
        {isLoading && (
          <>
            <Spin /> <p className="sr-only">Loading accounts</p>
          </>
        )}
        {error && (
          <GenericErrorCard
            title="Error fetching accounts"
            description={error.message}
          />
        )}
        {!isLoading && !error && accounts.length === 0 && (
          <NotificationCard
            className="w-full"
            description="No accounts found"
            icon={<IconInfoCircle />}
          />
        )}
        {!isLoading && !error && accounts.length > 0 && (
          <Table
            rowKey="username"
            scroll={{ y: componentHeight }}
            dataSource={accounts}
            columns={columns}
            pagination={false}
            onScroll={handleScroll}
          />
        )}
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
        <NotificationCard
          className="w-full"
          icon={<IconInfoCircle />}
          title="You do not have sufficient permissions"
          description="Please contact your administrator to request access."
        />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
