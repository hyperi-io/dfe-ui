import { Table } from '@/core/components/Table';
import { Tooltip } from '@/core/components/Tooltip';
import { INDEX_USE_CASE_OPTIONS } from '@/Schemas/constants/indexUseCase';
import { useFetchInfiniteFilteredSchemaDetailColumns } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns';
import { TMetaSchemaDetailColumnItem } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Alert, Input, Select, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useEffect, useMemo, useState } from 'react';
import {
  baseColumnFrom,
  chosenIndexFor,
  DerivedBaseColumn,
  DerivedSelectEntry,
  isColumnSelected,
  rebuildSelection,
  withIndexUseCase,
} from './DerivedSchemaFieldPicker.helpers';

/** One request covers most base schemas; the rest are drained below. */
const BASE_COLUMNS_PER_PAGE = 200;

const EMPTY_SELECTION: DerivedSelectEntry[] = [];

const readOnlyCell = (value?: string | null) =>
  value ? (
    <span>{value}</span>
  ) : (
    <span className="text-foreground/40 dark:text-dark-foreground/40">-</span>
  );

export interface DerivedSchemaFieldPickerProps {
  /** Registry path of the meta schema the columns come from. */
  basePath: string | null;
  /** Version of that meta schema. */
  baseVersion: string | null;
  value?: DerivedSelectEntry[];
  onChange?: (value: DerivedSelectEntry[]) => void;
  disabled?: boolean;
}

/**
 * Picks the subset of a meta schema's columns a derived schema deploys.
 *
 * Everything but the index use case is the base column's and is shown read-only,
 * because a derived schema may add an index and nothing else.
 */
export const DerivedSchemaFieldPicker = ({
  basePath,
  baseVersion,
  value = EMPTY_SELECTION,
  onChange,
  disabled = false,
}: DerivedSchemaFieldPickerProps) => {
  const [search, setSearch] = useState('');

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredSchemaDetailColumns({
    schema_path: basePath,
    version: baseVersion,
    per_page: BASE_COLUMNS_PER_PAGE,
  });

  // The whole base has to be pickable, so the filter never misses a column
  // that has not been scrolled to yet.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const columnItems = useMemo(() => data?.version.columns.items ?? [], [data]);

  const baseColumns: DerivedBaseColumn[] = useMemo(
    () => columnItems.map(baseColumnFrom),
    [columnItems],
  );

  const baseColumnByName = useMemo(
    () => new Map(baseColumns.map((column) => [column.name, column])),
    [baseColumns],
  );

  const visibleItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (term === '') {
      return columnItems;
    }
    return columnItems.filter((item) =>
      (item.name ?? '').toLowerCase().includes(term),
    );
  }, [columnItems, search]);

  const selectedRowKeys = useMemo(
    () => value.map((entry) => entry.name),
    [value],
  );

  const handleSelectionChange = (keys: React.Key[]) => {
    onChange?.(rebuildSelection(baseColumns, keys.map(String), value));
  };

  const tableColumns = useMemo((): ColumnsType<TMetaSchemaDetailColumnItem> => {
    return [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        render: (name: string) => <span className="font-medium">{name}</span>,
      },
      {
        title: 'Index use case',
        key: 'index',
        width: 320,
        render: (_: unknown, record: TMetaSchemaDetailColumnItem) => {
          const column = baseColumnByName.get(record.name ?? '');
          if (!column) {
            return null;
          }
          const selected = isColumnSelected(value, column.name);
          return (
            <Select
              className="w-full"
              size="small"
              aria-label={`Index use case for ${column.name}`}
              options={INDEX_USE_CASE_OPTIONS}
              popupMatchSelectWidth={false}
              value={chosenIndexFor(value, column)}
              disabled={disabled || !selected}
              onChange={(chosen) =>
                onChange?.(withIndexUseCase(value, column, chosen))
              }
            />
          );
        },
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
        render: (type: string) => readOnlyCell(type),
      },
      {
        title: 'Attribute',
        dataIndex: 'attribute',
        key: 'attribute',
        render: (attribute: string[] | null) =>
          attribute && attribute.length > 0 ? (
            <span className="flex flex-wrap gap-1">
              {attribute.map((item) => (
                <Tag className="m-0" key={item}>
                  {item}
                </Tag>
              ))}
            </span>
          ) : (
            readOnlyCell(null)
          ),
      },
      {
        title: 'Expression (CTE)',
        dataIndex: 'expr',
        key: 'expr',
        render: (expr: string) => readOnlyCell(expr),
      },
      {
        title: 'Comment',
        dataIndex: 'comment',
        key: 'comment',
        render: (comment: string) => readOnlyCell(comment),
      },
    ];
    // `value` and `onChange` drive the two interactive cells; the rest are static.
  }, [baseColumnByName, value, onChange, disabled]);

  if (!basePath || !baseVersion) {
    return (
      <Alert
        type="info"
        showIcon
        icon={<IconInfoCircle />}
        title="Select a base meta schema and version to choose its columns."
      />
    );
  }

  if (isError) {
    return (
      <Alert
        type="error"
        showIcon
        title={`The columns of ${basePath} ${baseVersion} could not be loaded.`}
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-foreground/60 dark:text-dark-foreground/60">
          {value.length} of {columnItems.length} columns selected
          <Tooltip
            destroyOnHidden
            title="Type, expression, comment and attribute come from the base meta schema. A derived schema only chooses columns and their index use case."
          >
            <IconInfoCircle className="ml-1 inline align-text-bottom" />
          </Tooltip>
        </p>
        <Input.Search
          allowClear
          className="w-56"
          placeholder="Filter columns"
          aria-label="Filter columns"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <Table<TMetaSchemaDetailColumnItem>
        columns={tableColumns}
        dataSource={visibleItems}
        rowKey="name"
        loading={isLoading || isFetchingNextPage}
        pagination={false}
        scroll={{ y: 360, x: 'max-content' }}
        rowSelection={{
          selectedRowKeys,
          preserveSelectedRowKeys: true,
          getCheckboxProps: () => ({ disabled }),
          onChange: handleSelectionChange,
        }}
        locale={{
          emptyText: (
            <div className="flex items-center justify-center gap-2 text-foreground-muted dark:text-dark-foreground-muted">
              <IconInfoCircle className="w-4 h-4" />
              <p>No columns match the filter</p>
            </div>
          ),
        }}
      />
    </div>
  );
};
