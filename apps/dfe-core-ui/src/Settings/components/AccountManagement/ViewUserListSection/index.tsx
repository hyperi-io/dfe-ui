import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { OrganisationSelect } from '@/core/components/OrganisationSelect';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { Table } from '@/core/components/Table';
import { useAdministeredOrg } from '@/core/hooks/useAdministeredOrg';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { renderColumns } from '@/Settings/helpers/accountManagementHelpers';
import { useFetchInfiniteFilteredAccounts } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts';
import { TAccountsItemSummary } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input, Spin } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

export const ViewUserListSection = () => {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  // An organisation's Users tab links here with ?org= to open on its accounts.
  const [org, setOrg] = useState(searchParams.get('org') ?? undefined);
  const administeredOrg = useAdministeredOrg();
  const pageSizeParam = searchParams.get('page_size');
  const parsedPageSize = pageSizeParam
    ? Number.parseInt(pageSizeParam, 10)
    : undefined;
  const page_size = Number.isInteger(parsedPageSize)
    ? parsedPageSize
    : undefined;
  const {
    data: { items: accounts = [] },
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useFetchInfiniteFilteredAccounts({
    search,
    org,
    blocked: false,
    page_size,
    // Root accounts (no org) sort first, then each org's, by username.
    sort_by: 'org',
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 350,
  });

  // The engine names its own bootstrap admin, so a renamed one is still marked.
  const { data: setupStatus } = useFetchSetupStatus();
  const isRetiredAdmin = (account: TAccountsItemSummary) =>
    Boolean(setupStatus?.admin_retired) &&
    account.username === setupStatus?.admin_username;

  const columns = renderColumns({ isRetiredAdmin });
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
    <SectionCard
      title="Manage existing accounts"
      description="Manage local accounts, group memberships, and account status."
      rightTitleSlot={
        <div className="ml-auto flex items-start gap-2">
          {!administeredOrg && (
            <OrganisationSelect
              allowClear
              aria-label="Filter by organisation"
              className="w-48"
              placeholder="All organisations"
              value={org}
              onChange={setOrg}
            />
          )}
          <Input.Search
            className="w-60"
            placeholder="Search accounts"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            allowClear
          />
        </div>
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
  );
};
