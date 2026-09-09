'use client';

import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchInfiniteFilteredAccounts } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts';
import { TAccountsItemSummary } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input, Spin, Table, Tag, Tooltip } from 'antd';
import { useCallback, useState } from 'react';
import { InviteUserDrawer } from './InviteUserDrawer';
import { RowActions } from './RowActions';

export const AccountManagement = () => {
  const [search, setSearch] = useState('');
  const {
    data: { items: accounts = [] },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
    refetch,
  } = useFetchInfiniteFilteredAccounts({ search });

  const { componentHeight } = useSetComponentHeight({
    offset: 350,
  });

  // The engine names its own bootstrap admin, so a renamed one is still marked.
  const { data: setupStatus } = useFetchSetupStatus();
  const isRetiredAdmin = (account: TAccountsItemSummary) =>
    Boolean(setupStatus?.admin_retired) &&
    account.username === setupStatus?.admin_username;

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 120,
      render: (enabled: boolean, record: TAccountsItemSummary) =>
        isRetiredAdmin(record) ? (
          <Tooltip
            destroyOnHidden
            title="Retired: the deployment stopped recreating this account, so its installed password no longer works. Break-glass is the way back in."
          >
            <Tag color="default">Retired</Tag>
          </Tooltip>
        ) : (
          <Tag color={enabled ? 'green' : 'red'}>
            {enabled ? 'Active' : 'Inactive'}
          </Tag>
        ),
    },
    {
      title: 'Groups',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups: string[]) =>
        groups?.length ? (
          <Tooltip destroyOnHidden title={groups.join(', ')}>
            <Tag>
              {groups.length} Group{groups.length > 1 ? 's' : ''}
            </Tag>
          </Tooltip>
        ) : null,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 85,
      align: 'center' as const,
      render: (_: unknown, record: TAccountsItemSummary) => (
        <RowActions
          username={record.username}
          isActive={record.enabled}
          refetch={refetch}
        />
      ),
    },
  ];

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
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
      {/* <SectionCard
        title="Link a new account"
        description="Link an external identity to the platform (coming soon)."
        rightTitleSlot={<LinkAccountDrawer />}
      /> */}
      <SectionCard
        title="Invite a new user"
        description="Create a local user account and assign group memberships."
        rightTitleSlot={<InviteUserDrawer refetch={refetch} />}
      />
      <SectionCard
        title="Manage existing accounts"
        description="Manage local accounts, group memberships, and account status."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search accounts"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            allowClear
          />
        }
      >
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
      </SectionCard>
    </div>
  );
};
