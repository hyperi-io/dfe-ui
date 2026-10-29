import { CatalogueTags } from '@/core/components/CatalogueTags';
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
import { useState } from 'react';
import Highlighter from 'react-highlight-words';
import { AddFromCatalogueFormValues } from './AddFromCatalogueForm';
import { INTAKE_OPTIONS, INTAKE_OPTIONS_MAP } from './constants';

/** The engine refuses a catalogue create longer than this. */
export const MAX_CATALOGUE_ENTRIES = 50;

const DIGIT_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
] as const;

export const toSourceName = (entryName: string) =>
  entryName
    .replaceAll('_', '-')
    .replace(/\d/, (digit) => DIGIT_WORDS[Number(digit)] ?? digit)
    .toLowerCase()
    .slice(0, 40);

const toSelectedEntry = (
  row: TSourceCatalogueItem,
): AddFromCatalogueFormValues => ({
  entry: row.name,
  name: toSourceName(row.name),
  intake: row.intakes?.[0] as AddFromCatalogueFormValues['intake'],
  transport: 'bus',
  archive: false,
  intakeOptions: row.intakes,
});

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
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [intakeFilter, setIntakeFilter] = useState<TSourceCatalogueIntake>();

  const {
    data: { items: entries, total },
    isLoading,
    isFetchingNextPage,
  } = useFetchInfiniteSourceCatalogues({
    search,
    intake: intakeFilter,
    per_page: pageSize,
    tags: searchTags,
    page,
  });

  // The server already returned this page. Selected rows stay checked via
  // selectedRowKeys; mixing them into the page makes the list longer than
  // pageSize, and Ant Design then slices it again.
  const rows = entries ?? [];
  const selectionExceedsLimit = selectedEntries.length > MAX_CATALOGUE_ENTRIES;

  const rowsSelectedOffset = selectedEntries?.length > 0 ? 60 : 0;
  const selectionExceedsLimitOffset = selectionExceedsLimit ? 45 : 0;
  const catalogueTagsOffset = searchTags.length > 0 ? 45 : 0;
  const { componentHeight } = useSetComponentHeight({
    offset:
      260 +
      selectionExceedsLimitOffset +
      rowsSelectedOffset +
      catalogueTagsOffset,
  });

  // A wide row scrolls sideways, so the name and its Select stay pinned in view.
  const columns: ColumnsType<TSourceCatalogueItem> = rows.length
    ? [
        {
          title: 'Entry',
          dataIndex: 'name',
          key: 'name',
          width: '40%',
          fixed: 'start',
          render: (name) => (
            <Highlighter searchWords={[search]} textToHighlight={name} />
          ),
        },
        {
          title: 'Dataset',
          dataIndex: 'dataset',
          key: 'dataset',
          width: '40%',
        },
        {
          title: 'Arrives by',
          dataIndex: 'intakes',
          key: 'intakes',
          width: 220,
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
      {selectionExceedsLimit && (
        <NotificationCard
          type="warning"
          title={`At most ${MAX_CATALOGUE_ENTRIES} entries can be created at once`}
        />
      )}
      {selectedEntries.length > 0 && (
        <NotificationCard
          type="info"
          title={
            <span className="whitespace-nowrap">
              {`${selectedEntries.length} entries selected`}{' '}
              <Button
                type="link"
                size="small"
                onClick={() => onSelectedEntriesChange([])}
              >
                Clear Selection
              </Button>
            </span>
          }
          action={
            <Button
              type="primary"
              onClick={onUpload}
              disabled={selectionExceedsLimit}
            >
              Review Catalogues
            </Button>
          }
        />
      )}

      <CatalogueTags
        onChange={(tags) => {
          setSearchTags(tags);
        }}
      />

      <Table<TSourceCatalogueItem>
        loading={isLoading || isFetchingNextPage}
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
          selectedRowKeys: selectedEntries.map((entry) => entry.entry),
          preserveSelectedRowKeys: true,
          onChange: (selectedRowKeys, selectedRows) => {
            const previous = new Map(
              selectedEntries.map((entry) => [entry.entry, entry]),
            );
            const seen = new Set<string>();
            const next: AddFromCatalogueFormValues[] = [];
            selectedRowKeys.forEach((key, index) => {
              const id = String(key);
              if (!id || seen.has(id)) return;
              seen.add(id);
              const existing = previous.get(id);
              if (existing) {
                next.push(existing);
                return;
              }
              const row = selectedRows[index];
              if (row?.name) next.push(toSelectedEntry(row));
            });
            onSelectedEntriesChange(next);
          },
        }}
        title={() => (
          <div className="flex justify-between items-center gap-4">
            <span className="font-medium whitespace-nowrap">
              {rows.length} of {Math.max(total ?? 0, rows.length)} entries shown
            </span>
            <div className="flex items-center gap-2">
              <Input.Search
                placeholder="Search by name or dataset"
                allowClear
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />

              <Select
                className="w-96"
                placeholder="Select intake"
                allowClear
                value={intakeFilter}
                onChange={(value) => {
                  setIntakeFilter(value);
                  setPage(1);
                }}
                options={INTAKE_OPTIONS}
              />
            </div>
          </div>
        )}
        rowKey="name"
        columns={columns}
        dataSource={rows}
        onChange={({ current, pageSize }) => {
          if (current) {
            setPage(current);
          }
          if (pageSize) {
            setPageSize(pageSize);
          }
        }}
        pagination={{
          pageSize: pageSize,
          total: total ?? 0,
          current: page,
        }}
      />
    </div>
  );
};
