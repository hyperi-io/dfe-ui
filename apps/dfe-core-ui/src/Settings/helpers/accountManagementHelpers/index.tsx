import { Tooltip } from '@/core/components/Tooltip';
import { RowActions } from '@/Settings/components/AccountManagement/RowActions';
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
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => name?.trim() || <EmptyText />,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (email: string) => email?.trim() || <EmptyText />,
  },
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
