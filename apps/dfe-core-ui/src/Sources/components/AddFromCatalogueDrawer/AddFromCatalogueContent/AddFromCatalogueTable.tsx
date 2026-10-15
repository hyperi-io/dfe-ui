import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchInfiniteSourceCatalogues } from '@/Sources/hooks/useFetchInfiniteSourceCatalogues';
import {
  TSourceCatalogueIntake,
  TSourceCatalogueItem,
} from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';
import { Button, Input, Select, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { INTAKE_OPTIONS, INTAKE_OPTIONS_MAP } from './constants';

export const AddFromCatalogueTable = ({
  onSelect,
}: {
  onSelect: (entry: TSourceCatalogueItem) => void;
}) => {
  const [search, setSearch] = useState('');
  const [intakeFilter, setIntakeFilter] = useState<TSourceCatalogueIntake>();

  const { componentHeight } = useSetComponentHeight({
    offset: 220,
  });

  const {
    data: { items: entries, total },
    isLoading,
    fetchNextPage: fetchNextPageSourceCatalogues,
    hasNextPage: hasNextPageSourceCatalogues,
    isFetchingNextPage: isFetchingNextPageSourceCatalogues,
  } = useFetchInfiniteSourceCatalogues({
    search,
    intake: intakeFilter,
    per_page: 20,
  });

  const columns: ColumnsType<TSourceCatalogueItem> = entries?.length
    ? [
        {
          title: 'Entry',
          dataIndex: 'name',
          key: 'name',
          width: '50%',
          render: (name) => (
            <Highlighter searchWords={[search]} textToHighlight={name} />
          ),
        },
        {
          title: 'Dataset',
          dataIndex: 'dataset',
          key: 'dataset',
          width: '50%',
        },
        {
          title: 'Arrives by',
          dataIndex: 'intakes',
          key: 'intakes',
          width: '220px',
          render: (intakes: string[]) => (
            <div className="flex gap-2">
              {intakes.map((intake) => (
                <Tag key={intake}>
                  <Highlighter
                    searchWords={
                      intakeFilter
                        ? [
                            INTAKE_OPTIONS_MAP[
                              intakeFilter as keyof typeof INTAKE_OPTIONS_MAP
                            ] ?? intake,
                          ]
                        : []
                    }
                    textToHighlight={
                      INTAKE_OPTIONS_MAP[
                        intake as keyof typeof INTAKE_OPTIONS_MAP
                      ] ?? intake
                    }
                  />
                </Tag>
              ))}
            </div>
          ),
        },
        {
          title: '',
          key: 'select',
          width: '75px',
          render: (_: unknown, entry: TSourceCatalogueItem) => (
            <Button size="small" type="primary" onClick={() => onSelect(entry)}>
              Select
            </Button>
          ),
        },
      ]
    : [];

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement, UIEvent>) => {
      const el = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = el;

      if (!hasNextPageSourceCatalogues || isFetchingNextPageSourceCatalogues)
        return;

      // Fetch data when user is near the bottom
      if (scrollHeight - scrollTop - clientHeight < 40) {
        void fetchNextPageSourceCatalogues();
      }
    },
    [
      hasNextPageSourceCatalogues,
      isFetchingNextPageSourceCatalogues,
      fetchNextPageSourceCatalogues,
    ],
  );

  return (
    <Table<TSourceCatalogueItem>
      loading={isLoading}
      scroll={{ y: componentHeight, x: 'max-content' }}
      locale={{
        emptyText: !isLoading && (
          <NotificationCard
            type="default"
            title="No catalogue is mounted on this deployment, or nothing matches the filter."
          />
        ),
      }}
      title={() => (
        <div className="flex justify-between items-center">
          <span className="font-medium">
            {entries?.length} of {total} entries shown
          </span>
          <div className="flex items-center gap-2">
            <Input.Search
              placeholder="Search by name or dataset"
              allowClear
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Select
              className="w-96"
              placeholder="Select intake"
              allowClear
              value={intakeFilter}
              onChange={(value) => setIntakeFilter(value)}
              options={INTAKE_OPTIONS}
            />
          </div>
        </div>
      )}
      rowKey="name"
      columns={columns}
      dataSource={entries}
      onScroll={handleScroll}
    />
  );
};
