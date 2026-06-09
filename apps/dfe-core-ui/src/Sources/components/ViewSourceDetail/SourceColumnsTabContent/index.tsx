import { GenericErrorCard } from '@/core/components/GenericError';
import { SchemaTable } from '@/core/components/SchemaTable';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchInfiniteSourceColumns } from '@/Sources/hooks/useFetchInfiniteSourceColumns';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';
import { useCallback } from 'react';

export const SourceColumnsTabContent = ({
  source_name,
}: {
  source_name: string;
}) => {
  const { componentHeight } = useSetComponentHeight({ offset: 300 });
  const {
    data: { items: sourceColumns = [] } = {},
    error,
    isLoading,
    fetchNextPage: fetchNextPageSourceColumns,
    hasNextPage: hasNextPageSourceColumns,
    isFetchingNextPage: isFetchingNextPageSourceColumns,
  } = useFetchInfiniteSourceColumns({ source_name, per_page: 50 });

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const el = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (!hasNextPageSourceColumns || isFetchingNextPageSourceColumns) return;

      // Fetch data when user is near the bottom
      if (scrollHeight - scrollTop - clientHeight < 40) {
        void fetchNextPageSourceColumns();
      }
    },
    [
      hasNextPageSourceColumns,
      isFetchingNextPageSourceColumns,
      fetchNextPageSourceColumns,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spin />
        <p className="sr-only">Loading source columns</p>
      </div>
    );
  }

  if (error) {
    return (
      <GenericErrorCard
        title="Error fetching source columns"
        description={error.message}
      />
    );
  }
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Attribute',
      dataIndex: 'attribute',
      key: 'attribute',
    },
    {
      title: 'Index Type',
      dataIndex: 'use_case',
      key: 'use_case',
    },
    {
      title: 'Comment',
      dataIndex: 'comment',
      key: 'comment',
    },
  ];

  return (
    <SchemaTable
      rowKey="name"
      visibleColumns={['name', 'type', 'attribute', 'use_case', 'comment']}
      lockedColumns={['name']}
      dataSource={sourceColumns ?? []}
      columns={columns}
      loading={isFetchingNextPageSourceColumns}
      scroll={{ y: componentHeight, x: 'max-content' }}
      locale={{
        emptyText: (
          <div className="flex items-center justify-center gap-2 text-foreground-muted dark:text-dark-foreground-muted">
            <IconInfoCircle className="w-4 h-4" />
            <p>No columns loaded</p>
          </div>
        ),
      }}
      onScroll={handleScroll}
    />
  );
};
