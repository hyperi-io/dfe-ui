import { IconMenu2, IconX } from '@repo/dfe-icons';
import { Button, TableProps } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { ConfigureSearchableColumnsCollapse } from './ConfigureSearchableColumnsCollapse';
import { ConfigureVisibleColumnsCollapse } from './ConfigureVisibleColumnsCollapse';

interface SchemaTableTitleProps<T extends object> {
  title: TableProps<T>['title'];
  selectedVisibleColumns: string[];
  columns: { label: string; value: string }[];
  setSelectedVisibleColumns: (value: string[]) => void;
  lockedColumns?: string[];
  showSearchableColumns?: {
    searchableColumnsOptions: { label: string; value: string }[];
    selectedSearchableColumns: string[];
    setSelectedSearchableColumns: (value: string[]) => void;
  };
}
export const SchemaTableTitle = <T extends object>({
  title,
  selectedVisibleColumns,
  columns,
  setSelectedVisibleColumns,
  lockedColumns = [],
  showSearchableColumns,
}: SchemaTableTitleProps<T>) => {
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
            <ConfigureVisibleColumnsCollapse
              selectedVisibleColumns={selectedVisibleColumns}
              columns={columns}
              setSelectedVisibleColumns={setSelectedVisibleColumns}
              lockedColumns={lockedColumns}
            />
            {showSearchableColumns && (
              <ConfigureSearchableColumnsCollapse {...showSearchableColumns} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
