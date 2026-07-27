import { NotificationCard } from '@/core/components/NotificationCard';
import { SectionCard } from '@/core/components/SectionCard';
import { formatDateToString } from '@/core/helpers/date.helpers';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchInfiniteFilteredApiKeys } from '@/Settings/hooks/apiKeys/useFetchInfiniteFilteredApiKeys';
import { IconCheck, IconTrash, IconX } from '@repo/dfe-icons';
import { Button, Input, Table } from 'antd';
import { useCallback, useState } from 'react';
import { CreateApiKeyDrawer } from './CreateApiKeyDrawer';

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
      render: () => (
        <Button
          type="default"
          size="small"
          shape="circle"
          icon={<IconTrash />}
          onClick={() => {}}
          danger
        />
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
        {error && <NotificationCard type="error" title={error.message} />}
        <Table
          rowKey="short_token"
          dataSource={apiKeys}
          loading={isLoading}
          columns={columns}
          scroll={{ y: componentHeight }}
          pagination={false}
          onScroll={handleScroll}
        />
      </SectionCard>
    </>
  );
};
