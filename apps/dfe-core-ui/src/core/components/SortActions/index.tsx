import { cn } from '@/core/utils/style';
import { IconSortAscending, IconSortDescending } from '@repo/dfe-icons';
import { Button, Select } from 'antd';
import { startTransition, useEffect, useState } from 'react';

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
  id: {
    select: string;
  };
  classNames?: {
    root?: string;
    select?: string;
    button?: string;
    label?: string;
  };
  layout?: 'horizontal' | 'vertical';
}

const DEFAULT_DIRECTION = 'asc' as const;

export const SortActions = ({
  sortByValue,
  sortDirectionValue,
  sortByOptions,
  onChange,
  className,
  id,
  classNames,
  layout = 'horizontal',
}: SortActionsProps) => {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (sortDirectionValue as 'asc' | 'desc') ?? DEFAULT_DIRECTION,
  );

  useEffect(() => {
    if (sortDirectionValue === 'asc' || sortDirectionValue === 'desc') {
      startTransition(() => setSortDirection(sortDirectionValue));
    }
  }, [sortDirectionValue]);

  return (
    <div
      className={cn(
        layout === 'horizontal'
          ? 'flex justify-between items-center flex-wrap gap-y-2'
          : 'flex flex-col gap-2',
        className,
        classNames?.root,
      )}
    >
      <label className={classNames?.label} htmlFor={id.select}>
        Sort by
      </label>

      <div className={cn('flex gap-2 items-center', classNames?.select)}>
        {sortByOptions && (
          <Select
            id={id.select}
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
          className={cn('w-10', classNames?.button)}
          icon={
            sortDirection === 'asc' ? (
              <IconSortDescending />
            ) : (
              <IconSortAscending />
            )
          }
          onClick={() => {
            const next = sortDirection === 'asc' ? 'desc' : 'asc';
            setSortDirection(next);
            onChange({ sortDirection: next });
          }}
        />
      </div>
    </div>
  );
};
