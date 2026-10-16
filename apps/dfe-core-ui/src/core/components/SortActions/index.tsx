import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { IconSortAscending, IconSortDescending, IconX } from '@repo/dfe-icons';
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
  const [showOptions, setShowOptions] = useState(false);
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
      <button
        type="button"
        className={cn('w-full  rounded-md', classNames?.label)}
        onClick={() => {
          setShowOptions(!showOptions);
        }}
      >
        <label
          className={cn('flex items-center justify-between', classNames?.label)}
          htmlFor={id.select}
        >
          Sort by
          <span className="bg-foreground/10 dark:bg-dark-foreground/10 px-2 py-1 rounded-md text-xs hover:bg-foreground/5 dark:hover:bg-dark-foreground/5">
            {sortByValue && sortDirectionValue
              ? `${sortByOptions?.find((option) => option.value === sortByValue)?.label} - ${sortDirectionValue}`
              : 'Default'}
          </span>
        </label>
      </button>

      {showOptions && (
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
          <Tooltip
            title={
              sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'
            }
          >
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
          </Tooltip>

          {(sortByValue || sortDirectionValue) && (
            <Tooltip title="Clear sort">
              <Button
                size="small"
                className={cn('w-10', classNames?.button)}
                icon={<IconX />}
                aria-label="Clear sort"
                onClick={() => {
                  setSortDirection(DEFAULT_DIRECTION);
                  onChange({ sortDirection: '', sortBy: '' });
                  setShowOptions(false);
                }}
              />
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
};
