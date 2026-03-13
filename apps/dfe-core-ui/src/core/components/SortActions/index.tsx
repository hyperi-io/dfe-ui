import { cn } from '@/core/utils/style';
import { IconSortAscending, IconSortDescending } from '@dfe/icons';
import { Button, Select } from 'antd';
import { useState } from 'react';

interface SortActionsProps {
  sortByValue?: string;
  sortDirectionValue?: string;
  sortByOptions?: { label: string; value: string }[];
  onChange: ({
    sortBy,
    sortDirection,
  }: {
    sortBy?: string;
    sortDirection?: string;
  }) => void;
  className?: string;
}

export const SortActions = ({
  sortByValue,
  sortDirectionValue,
  sortByOptions,
  onChange,
  className,
}: SortActionsProps) => {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (sortDirectionValue as 'asc' | 'desc') ?? 'asc',
  );

  return (
    <div className={cn('flex gap-2 items-center', className)}>
      {sortByOptions && (
        <Select
          size="small"
          className="w-full"
          value={sortByValue}
          options={sortByOptions}
          onChange={(value) => onChange({ sortBy: value })}
          placeholder="Sort by"
        />
      )}
      <Button
        size="small"
        className="w-10"
        icon={
          sortDirection === 'asc' ? (
            <IconSortDescending />
          ) : (
            <IconSortAscending />
          )
        }
        onClick={() => {
          setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
          onChange({
            sortDirection,
          });
        }}
      />
    </div>
  );
};
