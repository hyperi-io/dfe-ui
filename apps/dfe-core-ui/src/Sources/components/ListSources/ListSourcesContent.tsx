import { SortActions } from '@/core/components/SortActions';
import { Table } from '@/core/components/Table';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { SourceSummary } from '@/Sources/hooks/useFetchInfiniteFilteredSources/types';
import { devLogger } from '@dfe/dev-logger';
import { IconEdit, IconTrash } from '@dfe/icons';
import { Button, Spin } from 'antd';
import { ColumnType } from 'antd/es/table';
import { useCallback } from 'react';
import { useListSourcesContext } from './context';
import { EmptyList } from './EmptyList';
import { ErrorList } from './ErrorList';
import { ViewMappingsModal } from './ViewMappingsModal';

const sourceSummaryColumns: ColumnType<SourceSummary>[] = [
  {
    title: 'Source',
    dataIndex: 'source',
    key: 'source',
  },
  {
    title: 'Display Name',
    dataIndex: 'display_name',
    key: 'display_name',
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
  },
  {
    title: 'Enabled',
    dataIndex: 'enabled',
    key: 'enabled',
  },
  {
    title: 'Header Type',
    dataIndex: 'header_type',
    key: 'header_type',
  },
  {
    title: 'Has Transform',
    dataIndex: 'has_transform',
    key: 'has_transform',
  },
  {
    title: 'Has Fetcher',
    dataIndex: 'has_fetcher',
    key: 'has_fetcher',
  },
  {
    title: 'Mapping Standards',
    dataIndex: 'mapping_standards',
    key: 'mapping_standards',
    width: 150,
    render: (_text: string, record: SourceSummary) => (
      <ViewMappingsModal
        disabled={record.mapping_standards?.length === 0}
        name={record.display_name ?? record.source}
        standards={record.mapping_standards ?? []}
      />
    ),
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    width: 100,
    render: (_text: string, record: SourceSummary) => (
      <div className="flex gap-2 text-foreground-muted dark:text-dark-foreground-muted">
        <Button
          type="default"
          shape="circle"
          aria-label={`Edit ${record.display_name ?? record.source}`}
          icon={<IconEdit />}
          onClick={() =>
            devLogger({
              level: 'info',
              message: `Edit ${record.display_name ?? record.source}`,
            })
          }
        />

        <Button
          type="default"
          shape="circle"
          aria-label={`Delete ${record.source}`}
          icon={<IconTrash />}
          onClick={() =>
            devLogger({ level: 'info', message: `Delete ${record.source}` })
          }
          danger
        />
      </div>
    ),
  },
];

export const ListSourcesContent = () => {
  const {
    data: { items: sources, total },
    isLoading,
    filters,
    hasFilters,
    setFilters,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    error,
  } = useListSourcesContext();

  const { componentHeight: tableHeight } = useSetComponentHeight({
    offset: 300,
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spin size="small" />
      </div>
    );
  }

  if (error) {
    return <ErrorList message={error.message} />;
  }

  if (sources.length === 0) {
    return <EmptyList setFilters={setFilters} hasFilters={hasFilters} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="text-md text-gray-400">
          {sources.length} of {total}{' '}
          {sources.length > 1 ? 'results' : 'result'}
        </p>

        <SortActions
          sortByValue={filters.sort_by}
          sortDirectionValue={filters.sort_order}
          sortByOptions={[
            { label: 'Source', value: 'source' },
            { label: 'Display Name', value: 'display_name' },
            { label: 'Enabled', value: 'enabled' },
          ]}
          sortDirectionOptions={[
            { label: 'Asc', value: 'asc' },
            { label: 'Desc', value: 'desc' },
          ]}
          onChange={({ sortBy, sortDirection }) =>
            setFilters({
              ...(sortBy !== undefined && { sort_by: sortBy }),
              ...(sortDirection !== undefined && { sort_order: sortDirection }),
            })
          }
        />
      </div>
      <Table<SourceSummary>
        loading={isLoading}
        scroll={{ y: tableHeight, x: 1000 }}
        dataSource={sources}
        columns={sourceSummaryColumns}
        rowKey="source"
        onScroll={handleScroll}
      />
    </div>
  );
};
