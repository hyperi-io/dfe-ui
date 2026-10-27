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
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(1);
  const [intakeFilter, setIntakeFilter] = useState<TSourceCatalogueIntake>();
  const [keptRows, setKeptRows] = useState<TSourceCatalogueItem[]>([]);

  const {
    data: { items: entries, total },
    isLoading,
    isFetchingNextPage,
  } = useFetchInfiniteSourceCatalogues({
    search,
    intake: intakeFilter,
    per_page: pageSize,
    page,
  });

  const selectedNames = new Set(selectedEntries.map((entry) => entry.name));
  const entriesByName = new Map(
    (entries ?? []).map((entry) => [entry.name, entry]),
  );
  const keptByName = new Map(keptRows.map((entry) => [entry.name, entry]));
  const pinned = selectedEntries.flatMap((entry) => {
    const row = entriesByName.get(entry.name) ?? keptByName.get(entry.name);
    return row ? [row] : [];
  });
  const rows = [
    ...pinned,
    ...(entries ?? []).filter((entry) => !selectedNames.has(entry.name)),
  ];
  const selectionExceedsLimit = selectedEntries.length > MAX_CATALOGUE_ENTRIES;

  const selectionExceedsLimitOffset = selectionExceedsLimit ? 45 : 0;
  const { componentHeight } = useSetComponentHeight({
    offset: 300 + selectionExceedsLimitOffset,
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
          title={`${selectedEntries.length} entries selected`}
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
          onChange: (_selectedRowKeys, selectedRows) => {
            const previous = new Map(
              selectedEntries.map((entry) => [entry.entry, entry]),
            );
            const seen = new Set<string>();
            const next: AddFromCatalogueFormValues[] = [];
            const rows: TSourceCatalogueItem[] = [];
            for (const row of selectedRows) {
              if (!row?.name || seen.has(row.name)) continue;
              seen.add(row.name);
              rows.push(row);
              next.push(previous.get(row.name) ?? toSelectedEntry(row));
            }
            setKeptRows(rows);
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
