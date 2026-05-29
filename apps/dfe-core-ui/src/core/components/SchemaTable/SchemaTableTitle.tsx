import { IconMenu2, IconX } from '@repo/dfe-icons';
import { Button, Checkbox, TableProps } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';

const isIncludedColumn = (column: string, lockedColumns: string[]) => {
  return !lockedColumns?.includes(column);
};
export const SchemaTableTitle = <T extends object>({
  title,
  selectedVisibleColumns,
  columns,
  setSelectedVisibleColumns,
  lockedColumns = [],
}: {
  title: TableProps<T>['title'];
  selectedVisibleColumns: string[];
  columns: string[];
  setSelectedVisibleColumns: (value: string[]) => void;
  lockedColumns?: string[];
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) {
        return;
      }
      setIsMenuOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isMenuOpen]);

  const columnsOptions = useMemo(() => {
    return columns.map((column) => ({
      label: column,
      value: column,
    }));
  }, [columns]);

  return (
    <div className="flex items-center gap-2 w-full">
      {title?.([])}

      <div className="ml-auto relative" ref={menuRef}>
        <Button
          type="default"
          icon={isMenuOpen ? <IconX /> : <IconMenu2 />}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
        {isMenuOpen && (
          <div className="absolute top-10 right-0 bg-background dark:bg-dark-background border border-foreground/10 dark:border-dark-foreground/10 p-4 rounded-md shadow-md z-2 w-96">
            <p className="font-medium mb-2 border-b border-border pb-2 border-foreground/10 dark:border-dark-foreground/10">
              Configure Visible Columns
            </p>

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
                            ? selectedVisibleColumns.filter(
                                (c) => c !== column.value,
                              )
                            : [...selectedVisibleColumns, column.value],
                        )
                      }
                    />
                  </div>
                ),
            )}
          </div>
        )}
      </div>
    </div>
  );
};
