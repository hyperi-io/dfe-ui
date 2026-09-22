import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { Table } from '@/core/components/Table';
import { formatDateToString } from '@/core/helpers/date.helpers';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchInfiniteFilteredApiKeys } from '@/Settings/hooks/apiKeys/useFetchInfiniteFilteredApiKeys';
import { TApiKeysItemSummary } from '@/Settings/hooks/apiKeys/useFetchInfiniteFilteredApiKeys/types';
import { IconCheck, IconX } from '@repo/dfe-icons';
import { Input } from 'antd';
import { useCallback, useState } from 'react';
import { CloneApiKeyDrawer } from './CloneApiKeyDrawer';
import { CreateApiKeyDrawer } from './CreateApiKeyDrawer';
import { RevokeApiKeyModal } from './RevokeApiKeyModal';

const API_KEYS_LIMIT = 10;

const EmptyText = () => (
  <span className="text-foreground/50 dark:text-foreground/50">None</span>
);
export const ApiKeyManagement = () => {
  const [search, setSearch] = useState('');
  const {
    data: { items: apiKeys },
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    error,
  } = useFetchInfiniteFilteredApiKeys({
    search,
  });

  const columns = [
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean) => (
        <span className="flex items-center gap-2">
          {enabled ? (
            <>
              <IconCheck /> Enabled
            </>
          ) : (
            <>
              <IconX /> Disabled
            </>
          )}
        </span>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => name || <EmptyText />,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || <EmptyText />,
    },
    {
      title: 'Created at',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (createdAt: string) => formatDateToString(createdAt),
    },
    {
      title: 'Expires at',
      dataIndex: 'expires_at',
      key: 'expires_at',
      render: (expiresAt: string) =>
        !!expiresAt ? formatDateToString(expiresAt) : <EmptyText />,
    },

    {
      title: 'Groups',
      dataIndex: 'groups',
      key: 'groups',
      render: (groups: string[]) => groups?.join(', ') || <EmptyText />,
    },
    {
      title: 'Actions',
      dataIndex: 'short_token',
      key: 'actions',
      width: 85,
      align: 'center' as const,
      render: (_: unknown, record: TApiKeysItemSummary) => (
        <span className="flex items-center gap-2">
          <CloneApiKeyDrawer
            initialValues={{
              name: `${record.name}_clone`,
              description: record.description,
              groups: record.groups,
            }}
          />
          <RevokeApiKeyModal
            shortToken={record.short_token}
            name={record.name}
          />
        </span>
      ),
    },
  ];

  const { componentHeight } = useSetComponentHeight({
    offset: 320,
  });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const el = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (!hasNextPage || isFetchingNextPage) return;

      // Fetch data when user is near the bottom
      if (scrollHeight - scrollTop - clientHeight < API_KEYS_LIMIT) {
        void fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage],
  );

  return (
    <>
      <SectionCard
        title="Create a new API key linked to groups or scopes"
        rightTitleSlot={<CreateApiKeyDrawer />}
      />
      <SectionCard
        title="API keys"
        rightTitleSlot={
          <Input.Search
            className="w-64"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
          />
        }
      >
        <RbacProtected action={RbacProtected.rbacActions.api_key_read}>
          <RbacProtected.Unrestricted>
            {error && <NotificationCard type="error" title={error.message} />}
            <Table
              rowKey="short_token"
              dataSource={apiKeys}
              rowClassName={({ expired }) =>
                expired ? 'opacity-50 bg-foreground/5' : ''
              }
              loading={isLoading}
              columns={columns}
              scroll={{ y: componentHeight }}
              pagination={false}
              onScroll={handleScroll}
            />
          </RbacProtected.Unrestricted>
          <RbacProtected.Restricted>
            <RbacProtected.RestrictedRoute />
          </RbacProtected.Restricted>
        </RbacProtected>
      </SectionCard>
    </>
  );
};
