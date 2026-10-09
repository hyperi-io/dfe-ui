import { SchemaColumnRow } from '@/core/components/CreateSchemaForm/AddSchemaTable/types';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { SchemaTable } from '@/core/components/SchemaTable';
import { Tooltip } from '@/core/components/Tooltip';
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
  const { componentHeight: tableHeight } = useSetComponentHeight({
    offset: 400,
  });
  const { componentHeight: contentHeight } = useSetComponentHeight({
    offset: 300,
  });
  const {
    data: { items: sourceColumns = [], total = 0 } = {},
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
      render: (value: string, record: SchemaColumnRow) => {
        return (
          <span className="flex items-center gap-1">
            {value}
            {record.ch_override && (
              <span className="text-xs bg-foreground/10 px-1 py-0.5 rounded-md dark:bg-dark-foreground/10 ml-auto">
                Override:{' '}
                {record.ch_override.startsWith('Enum16') ? (
                  <Tooltip
                    destroyOnHidden
                    title={
                      <div className="flex flex-col gap-2">
                        <p>
                          {record.ch_override.split('(')[1].split(',')[0] +
                            ' Values'}
                        </p>
                        <ul>
                          {record.ch_override
                            ?.replace(')', '')
                            .split('(')[1]
                            .split(',')
                            .map((value) => (
                              <li key={value}>{value}</li>
                            ))}
                        </ul>
                      </div>
                    }
                  >
                    <span>{record.ch_override.split('(')[0]}</span>
                  </Tooltip>
                ) : (
                  record.ch_override
                )}
              </span>
            )}
          </span>
        );
      },
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
    <CustomScrollbar height={contentHeight} className="flex flex-col">
      <SchemaTable<SchemaColumnRow>
        rowKey="name"
        title={() => (
          <div className="flex items-center justify-between w-full">
            <p> {total > 0 ? <>{total} columns</> : <>No columns loaded</>} </p>
          </div>
        )}
        visibleColumns={['name', 'type', 'attribute', 'use_case', 'comment']}
        lockedColumns={['_field_type', 'name']}
        dataSource={sourceColumns ?? []}
        columns={columns}
        loading={isFetchingNextPageSourceColumns}
        scroll={{ y: tableHeight, x: 'max-content' }}
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
    </CustomScrollbar>
  );
};
