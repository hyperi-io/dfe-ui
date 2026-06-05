import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Checkbox } from 'antd';
import { useState } from 'react';

const MIN_SEARCHABLE_COLUMNS_ERROR = 'Select at least one searchable column.';

interface ConfigureSearchableColumnsCollapseProps {
  selectedSearchableColumns: string[];
  searchableColumnsOptions: { label: string; value: string }[];
  setSelectedSearchableColumns: (value: string[]) => void;
}
export const ConfigureSearchableColumnsCollapse = ({
  selectedSearchableColumns,
  searchableColumnsOptions,
  setSelectedSearchableColumns,
}: ConfigureSearchableColumnsCollapseProps) => {
  const [error, setError] = useState<string | null>(null);

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
        container: 'px-0',
        title: 'font-semibold',
      }}
    >
      {error ? (
        <p className="mb-2 text-sm text-red-500" role="alert">
          {error}
        </p>
      ) : null}
      {searchableColumnsOptions.map((column) => (
        <div className="flex items-center justify-between" key={column.value}>
          <p>{column.label}</p>
          <Checkbox
            checked={selectedSearchableColumns.includes(column.value)}
            onChange={() => handleToggle(column.value)}
          />
        </div>
      ))}
    </SimpleCollapse>
  );
};
