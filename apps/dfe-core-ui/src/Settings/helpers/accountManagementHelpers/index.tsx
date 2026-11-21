import { Tooltip } from '@/core/components/Tooltip';
import { AccountOrg } from '@/Settings/components/AccountManagement/AccountOrg';
import { RowActions } from '@/Settings/components/AccountManagement/RowActions';
import { SignInProviders } from '@/Settings/components/AccountManagement/SignInProviders';
import { TAccountsItemSummary } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { Tag } from 'antd';

const EmptyText = () => (
  <span className="text-foreground/50 dark:text-dark-foreground/50">None</span>
);

export const renderColumns = ({
  isRetiredAdmin,
  renderActions = true,
}: {
  isRetiredAdmin: (record: TAccountsItemSummary) => boolean;
  renderActions?: boolean;
}) => [
  {
    title: 'Org',
    dataIndex: 'org',
    key: 'org',
    width: 130,
    render: (_: unknown, record: TAccountsItemSummary) => (
      <AccountOrg
        admin={record.admin}
        displayName={record.org_display_name}
        groups={record.groups}
        org={record.org}
      />
    ),
  },
  {
    title: 'User',
    key: 'user',
    render: (_: unknown, record: TAccountsItemSummary) => (
      <span className="flex flex-col">
        <span className="flex items-center gap-2">
          {record.name?.trim() || <EmptyText />}
        </span>
        {record.email?.trim() && (
          <span className="text-xs text-foreground/50 dark:text-dark-foreground/50">
            {record.email.trim()}
          </span>
        )}
      </span>
    ),
  },
  {
    title: 'Username',
    dataIndex: 'username',
    key: 'username',
    width: 280,
    render: (username: string, record: TAccountsItemSummary) => (
      <span className="flex items-center gap-2">
        {username}
        <SignInProviders account={record} />
      </span>
    ),
  },
  {
    title: 'Groups',
    dataIndex: 'groups',
    key: 'groups',
    width: 120,
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
    title: 'Status',
    dataIndex: 'enabled',
    key: 'enabled',
    width: 110,
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
  ...(renderActions
    ? [
        {
          title: 'Actions',
          key: 'actions',
          width: 85,
          align: 'center' as const,
          render: (_: unknown, record: TAccountsItemSummary) => (
            <RowActions
              username={record.username}
              isActive={record.enabled}
              isExternal={record.external}
              isBlocked={record.blocked}
            />
          ),
        },
      ]
    : []),
];
