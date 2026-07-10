'use client';

import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { SectionCard } from '@/Settings/components/SectionCard';
import { useFetchAccounts } from '@/Settings/hooks/useFetchAccounts';
import { TAccountsItemSummary } from '@/Settings/hooks/useFetchAccounts/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input, Spin, Table, Tag, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { InviteUserDrawer } from './InviteUserDrawer';
import { RowActions } from './RowActions';

export const AccountManagement = () => {
  const [search, setSearch] = useState('');
  const { data: accounts, isLoading, error, refetch } = useFetchAccounts();

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!accounts) {
      return [];
    }
    if (!query) {
      return accounts;
    }
    return accounts.filter((account) =>
      account.username.toLowerCase().includes(query),
    );
  }, [accounts, search]);

  const { componentHeight } = useSetComponentHeight({
    offset: 450,
  });

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
      render: (enabled: boolean) => (
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
            {!isLoading && !error && filteredAccounts.length === 0 && (
              <NotificationCard
                className="w-full"
                description="No accounts found"
                icon={<IconInfoCircle />}
              />
            )}
            {!isLoading && !error && filteredAccounts.length > 0 && (
              <Table
                rowKey="username"
                scroll={{ y: componentHeight }}
                dataSource={filteredAccounts}
                columns={columns}
                pagination={false}
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
