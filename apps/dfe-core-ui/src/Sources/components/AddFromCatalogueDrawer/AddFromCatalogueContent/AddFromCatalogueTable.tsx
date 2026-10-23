import { NotificationCard } from '@/core/components/NotificationCard';
import { Table } from '@/core/components/Table';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { useFetchInfiniteSourceCatalogues } from '@/Sources/hooks/useFetchInfiniteSourceCatalogues';
import {
  TSourceCatalogueIntake,
  TSourceCatalogueItem,
} from '@/Sources/hooks/useFetchInfiniteSourceCatalogues/types';
import { Button, Input, Select, Spin, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useState } from 'react';
import Highlighter from 'react-highlight-words';
import { AddFromCatalogueFormValues } from './AddFromCatalogueForm';
import { INTAKE_OPTIONS, INTAKE_OPTIONS_MAP } from './constants';

export const AddFromCatalogueTable = ({
  selectedEntries,
  onSelectedEntriesChange = () => {},
  onUpload,
}: {
  selectedEntries: AddFromCatalogueFormValues[];
  onSelectedEntriesChange?: (entries: AddFromCatalogueFormValues[]) => void;
  onUpload?: () => void;
}) => {
  const [search, setSearch] = useState('');
  const [intakeFilter, setIntakeFilter] = useState<TSourceCatalogueIntake>();

  const { componentHeight } = useSetComponentHeight({
    offset: 300,
  });

  const {
    data: { items: entries, total },
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    loadMoreRef,
  } = useFetchInfiniteSourceCatalogues({
    search,
    intake: intakeFilter,
    per_page: 20,
  });

  // A wide row scrolls sideways, so the name and its Select stay pinned in view.
  const columns: ColumnsType<TSourceCatalogueItem> = entries?.length
    ? [
        {
          title: 'Entry',
          dataIndex: 'name',
          key: 'name',
          width: '50%',
          fixed: 'start',
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
      ]
    : [];

  return (
    <div className="flex flex-col gap-2">
      {selectedEntries.length > 0 && (
        <NotificationCard
          type="info"
          title={`${selectedEntries.length} entries selected`}
          action={
            selectedEntries.length > 0 ? (
              <Button type="primary" onClick={onUpload}>
                Review Catalogues
              </Button>
            ) : null
          }
        />
      )}

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
        rowSelection={{
          selectedRowKeys: selectedEntries.map((entry) => entry.name),
          onChange: (_selectedRowKeys, selectedRows) => {
            onSelectedEntriesChange(
              selectedRows.map((row) => ({
                entry: row.name,
                name: row.name,
                intake: row.intakes?.[0] as 'beats' | 'fetcher' | 'receiver',
                transform: 'default',
                transport: 'bus',
                archive: false,
                intakeOptions: row.intakes,
              })),
            );
          },
        }}
        title={() => (
          <div className="flex justify-between items-center gap-4">
            <span className="font-medium whitespace-nowrap">
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
        summary={() =>
          hasNextPage ? (
            <tr>
              <td colSpan={columns.length}>
                <div
                  ref={loadMoreRef}
                  className="flex h-8 items-center justify-center"
                >
                  {isFetchingNextPage && <Spin size="small" />}
                </div>
              </td>
            </tr>
          ) : null
        }
      />
    </div>
  );
};
