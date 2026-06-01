import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Checkbox } from 'antd';
import { useMemo, useState } from 'react';

const MIN_SEARCHABLE_COLUMNS_ERROR =
  'Select at least one searchable column.';

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
  const [error, setError] = useState<string | null>(null);

  const columnsOptions = useMemo(() => {
    return searchableColumnsOptions.map((column) => ({
      label: column,
      value: column,
    }));
  }, [searchableColumnsOptions]);

  const handleToggle = (columnValue: string) => {
    const isSelected = selectedSearchableColumns.includes(columnValue);
    if (isSelected) {
      if (selectedSearchableColumns.length <= 1) {
        setError(MIN_SEARCHABLE_COLUMNS_ERROR);
        return;
      }
      setSelectedSearchableColumns(
        selectedSearchableColumns.filter((c) => c !== columnValue),
      );
      setError(null);
      return;
    }
    setSelectedSearchableColumns([...selectedSearchableColumns, columnValue]);
    setError(null);
  };

  return (
    <SimpleCollapse
      title="Configure Searchable Columns"
      classNames={{
        title: 'font-semibold',
      }}
    >
      {error ? (
        <p className="mb-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
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
                onChange={() => handleToggle(column.value)}
              />
            </div>
          ),
      )}
    </SimpleCollapse>
  );
};
