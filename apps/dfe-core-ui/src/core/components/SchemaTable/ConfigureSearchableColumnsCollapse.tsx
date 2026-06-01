import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Checkbox } from 'antd';
import { useMemo } from 'react';

const isIncludedColumn = (
  column: string,
  searchableColumnsOptions: string[],
) => {
  return searchableColumnsOptions?.includes(column);
};

interface ConfigureSearchableColumnsCollapseProps {
  selectedSearchableColumns: string[];
  searchableColumnsOptions: string[];
  setSelectedSearchableColumns: (value: string[]) => void;
}
export const ConfigureSearchableColumnsCollapse = ({
  selectedSearchableColumns,
  searchableColumnsOptions,
  setSelectedSearchableColumns,
}: ConfigureSearchableColumnsCollapseProps) => {
  const columnsOptions = useMemo(() => {
    return searchableColumnsOptions.map((column) => ({
      label: column,
      value: column,
    }));
  }, [searchableColumnsOptions]);

  return (
    <SimpleCollapse
      title="Configure Searchable Columns"
      classNames={{
        title: 'font-semibold',
      }}
    >
      {columnsOptions.map(
        (column) =>
          isIncludedColumn(column.value, searchableColumnsOptions) && (
            <div
              className="flex items-center justify-between"
              key={column.value}
            >
              <p>{column.label}</p>
              <Checkbox
                checked={selectedSearchableColumns.includes(column.value)}
                onChange={() =>
                  setSelectedSearchableColumns(
                    selectedSearchableColumns.includes(column.value)
                      ? selectedSearchableColumns.filter(
                          (c) => c !== column.value,
                        )
                      : [...selectedSearchableColumns, column.value],
                  )
                }
              />
            </div>
          ),
      )}
    </SimpleCollapse>
  );
};
