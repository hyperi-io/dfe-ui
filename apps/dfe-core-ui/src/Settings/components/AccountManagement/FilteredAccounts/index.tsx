import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { Table } from '@/core/components/Table';
import { useFetchSetupStatus } from '@/core/hooks/useFetchSetupStatus';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { renderColumns } from '@/Settings/helpers/accountManagementHelpers';
import { useFetchInfiniteFilteredAccounts } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts';
import {
  TAccountsItemSummary,
  TFetchAccountsQueryParams,
} from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { IconChevronRight, IconInfoCircle } from '@repo/dfe-icons';
import { Input } from 'antd';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

/** A searchable table of the accounts *filter* selects, such as a sign-in provider's or an organisation's, with an optional link to where they are edited. */
export const FilteredAccounts = ({
  filter,
  manageHref,
}: {
  filter: Pick<TFetchAccountsQueryParams, 'blocked' | 'oidc_id' | 'org'>;
  manageHref?: string;
}) => {
  const [search, setSearch] = useState('');
  const pageSizeParam = useSearchParams().get('page_size');
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
    ...filter,
    search,
    page_size,
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 350,
  });

  // The engine names its own bootstrap admin, so a renamed one is still marked.
  const { data: setupStatus } = useFetchSetupStatus();
  const isRetiredAdmin = (account: TAccountsItemSummary) =>
    Boolean(setupStatus?.admin_retired) &&
    account.username === setupStatus?.admin_username;

  // One organisation's table repeats its name on every row, and another organisation's accounts hold a role there rather than groups.
  const { data: yours } = useFetchYourOrganisation();
  const columns = renderColumns({
    isRetiredAdmin,
    orgColumn: !filter.org,
    renderActions: false,
    roleColumn:
      Boolean(filter.org) && Boolean(yours) && filter.org !== yours?.name,
  });
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
        {error ? (
          <GenericErrorCard
            title="Error fetching accounts"
            description={error.message}
          />
        ) : (
          // The table stays up with no rows, so a search that matches nothing keeps its box.
          <Table
            rowKey="username"
            scroll={{ y: componentHeight }}
            dataSource={accounts}
            columns={columns}
            loading={isLoading}
            pagination={false}
            onScroll={handleScroll}
            title={() => (
              <div className="flex items-center gap-2">
                {manageHref && (
                  <Link
                    href={manageHref}
                    className="flex items-center gap-1 text-sm text-tertiary! hover:underline"
                  >
                    Manage users
                    <IconChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
                <Input.Search
                  className="ml-auto w-60"
                  placeholder="Search users"
                  onChange={(e) => setSearch(e.target.value)}
                  value={search}
                  allowClear
                />
              </div>
            )}
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
