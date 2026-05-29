import { Table, TableProps } from '@/core/components/Table';
import { IconEye, IconEyeOff, IconSearch } from '@repo/dfe-icons';
import { Button, Tooltip } from 'antd';
import { useMemo, useState } from 'react';
import { SchemaTableTitle } from './SchemaTableTitle';

interface SchemaTableProps<T extends object> extends TableProps<T> {
  searchableColumns?: string[];
  visibleColumns?: string[];
}

export const SchemaTable = <T extends object>({
  visibleColumns: visibleColumnsProp,
  columns: originalColumns,
  title,
  ...props
}: SchemaTableProps<T>) => {
  const visibleColumns = useMemo(() => {
    return (
      visibleColumnsProp ??
      originalColumns?.map((column) => column.key as string) ??
      []
    );
  }, [visibleColumnsProp, originalColumns]);
  const [selectedVisibleColumns, setSelectedVisibleColumns] =
    useState<string[]>(visibleColumns);
  const columnKeys = useMemo(() => {
    return originalColumns?.map((column) => column.key as string) ?? [];
  }, [originalColumns]);

  const isAllColumnsVisible = useMemo(() => {
    return columnKeys.every((column) =>
      selectedVisibleColumns.includes(column),
    );
  }, [selectedVisibleColumns, columnKeys]);

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
                title={`Additional search matches on columns: ${columnSearchMatches.join(', ')}`}
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
          columns={columnKeys}
          setSelectedVisibleColumns={setSelectedVisibleColumns}
        />
      )}
      columns={displayedColumns}
      {...props}
    />
  );
};
