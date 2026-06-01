import { SimpleCollapse } from '@/core/components/SimpleCollapse';
import { Checkbox } from 'antd';
import { useMemo } from 'react';

const isIncludedColumn = (column: string, lockedColumns: string[]) => {
  return !lockedColumns?.includes(column);
};

interface ConfigureVisibleColumnsCollapseProps {
  selectedVisibleColumns: string[];
  columns: string[];
  setSelectedVisibleColumns: (value: string[]) => void;
  lockedColumns?: string[];
}
export const ConfigureVisibleColumnsCollapse = ({
  selectedVisibleColumns,
  columns,
  setSelectedVisibleColumns,
  lockedColumns = [],
}: ConfigureVisibleColumnsCollapseProps) => {
  const columnsOptions = useMemo(() => {
    return columns.map((column) => ({
      label: column,
      value: column,
    }));
  }, [columns]);

  return (
    <SimpleCollapse
      title="Configure Visible Columns"
      classNames={{
        title: 'font-semibold',
      }}
      defaultOpen={true}
    >
      {columnsOptions.map(
        (column) =>
          isIncludedColumn(column.value, lockedColumns) && (
            <div
              className="flex items-center justify-between"
              key={column.value}
            >
              <p>{column.label}</p>
              <Checkbox
                checked={selectedVisibleColumns.includes(column.value)}
                onChange={() =>
                  setSelectedVisibleColumns(
                    selectedVisibleColumns.includes(column.value)
                      ? selectedVisibleColumns.filter((c) => c !== column.value)
                      : [...selectedVisibleColumns, column.value],
                  )
                }
              />
            </div>
          ),
      )}
    </SimpleCollapse>
  );
};
