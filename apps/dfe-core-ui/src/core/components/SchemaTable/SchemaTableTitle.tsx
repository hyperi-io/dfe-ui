import { ActionsMenu } from '@/core/components/ActionsMenu';
import { TableProps } from 'antd';
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

      <ActionsMenu>
        <ConfigureVisibleColumnsCollapse
          selectedVisibleColumns={selectedVisibleColumns}
          columns={columns}
          setSelectedVisibleColumns={setSelectedVisibleColumns}
          lockedColumns={lockedColumns}
        />
        {showSearchableColumns && (
          <ConfigureSearchableColumnsCollapse {...showSearchableColumns} />
        )}
      </ActionsMenu>
    </div>
  );
};
