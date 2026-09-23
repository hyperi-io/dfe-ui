import { Table, TableProps } from '@/core/components/Table';
import { Tooltip } from '@/core/components/Tooltip';
import { IconEye, IconEyeOff, IconSearch } from '@repo/dfe-icons';
import { Button } from 'antd';

import uniq from 'lodash/uniq';
import { useMemo, useState } from 'react';
import { getColumnTitleText } from './SchemaTable.helpers';
import { SchemaTableTitle } from './SchemaTableTitle';

const TABLE_COLUMN_TITLE_DICT = {
  _field_type: 'Field Type',
  __rowId: 'Row ID',
  main_action: 'Main Action',
  name: 'Name',
  type: 'Type',
  expr: 'Expression',
  comment: 'Comment',
  attribute: 'Attribute',
  use_case: 'Index Type',
};
interface SchemaTableProps<T extends object> extends TableProps<T> {
  searchableColumns?: string[];
  visibleColumns?: string[];
  lockedColumns?: string[];
  showSearchableColumns?: {
    searchableColumnsOptions: { label: string; value: string }[];
    selectedSearchableColumns: string[];
    setSelectedSearchableColumns: (value: string[]) => void;
  };
}

export const SchemaTable = <T extends object>({
  visibleColumns: visibleColumnsProp = [],
  lockedColumns = [],
  columns: originalColumns = [],
  title,
  showSearchableColumns,
  ...props
}: SchemaTableProps<T>) => {
  const visibleColumns = useMemo(() => {
    return (
      uniq(visibleColumnsProp.concat(lockedColumns ?? [])) ??
      originalColumns?.map((column) => column.key as string) ??
      []
    );
  }, [visibleColumnsProp, originalColumns, lockedColumns]);
  const [selectedVisibleColumns, setSelectedVisibleColumns] =
    useState<string[]>(visibleColumns);
  const columnOptions = useMemo(() => {
    return (
      originalColumns?.map((column) => ({
        label: getColumnTitleText(column.title),
        value: column.key as string,
      })) ?? []
    );
  }, [originalColumns]);
  const columnKeys = useMemo(() => {
    return originalColumns?.map((column) => column.key as string) ?? [];
  }, [originalColumns]);

  const isAllColumnsVisible = useMemo(() => {
    return columnOptions.every((column) =>
      selectedVisibleColumns.includes(column.value),
    );
  }, [selectedVisibleColumns, columnOptions]);

  const filteredColumnsToDisplay = useMemo(() => {
    return originalColumns?.filter((column) => {
      return selectedVisibleColumns?.includes(column.key as string);
    });
  }, [originalColumns, selectedVisibleColumns]);

  const displayedColumns = filteredColumnsToDisplay?.concat([
    {
      title: 'Advanced',
      key: 'advanced',
      width: 90,
      align: 'center' as const,
      render: (_: unknown, record: T, index: number) => {
        const matchedSearchable =
          (record as { _matched_searchable?: string[] })._matched_searchable ??
          [];
        const columnSearchMatches =
          matchedSearchable?.filter(
            (column) => !selectedVisibleColumns.includes(column),
          ) ?? [];

        return (
          <div className="flex items-center justify-center relative">
            {columnSearchMatches.length > 0 && (
              <Tooltip
                title={`Additional search matches on columns: ${columnSearchMatches.map((column) => TABLE_COLUMN_TITLE_DICT[column as keyof typeof TABLE_COLUMN_TITLE_DICT] ?? column).join(', ')}`}
                destroyOnHidden
                key={index}
                placement="left"
              >
                <Button
                  className="absolute -left-5 bg-yellow-500"
                  htmlType="button"
                  size="small"
                  shape="circle"
                  type="primary"
                  color="yellow"
                  icon={<IconSearch />}
                />
              </Tooltip>
            )}
            <Tooltip
              title={isAllColumnsVisible ? 'Hide Advanced' : 'Show Advanced'}
              destroyOnHidden
            >
              <Button
                htmlType="button"
                size="small"
                shape="circle"
                onClick={() =>
                  setSelectedVisibleColumns(
                    isAllColumnsVisible ? visibleColumns : columnKeys,
                  )
                }
                icon={isAllColumnsVisible ? <IconEyeOff /> : <IconEye />}
              />
            </Tooltip>
          </div>
        );
      },
    },
  ]);

  return (
    <Table<T>
      title={() => (
        <SchemaTableTitle
          title={title}
          selectedVisibleColumns={selectedVisibleColumns}
          columns={columnOptions}
          setSelectedVisibleColumns={setSelectedVisibleColumns}
          lockedColumns={lockedColumns}
          showSearchableColumns={showSearchableColumns}
        />
      )}
      columns={displayedColumns}
      {...props}
    />
  );
};
