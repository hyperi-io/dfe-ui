import { cn } from '@/core/utils/style';
import type { SchemaDetailColumnFilterField } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { IconSearch, IconX } from '@repo/dfe-icons';
import { Input } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { useState } from 'react';

interface SchemaDetailColumnFilterTitleProps {
  title: string;
  filterKey: SchemaDetailColumnFilterField;
  filterValue: string | undefined;
  onFilterChange: (
    filterKey: SchemaDetailColumnFilterField,
    value: string | undefined,
  ) => void;
}

const SchemaDetailColumnFilterTitle = ({
  title,
  filterKey,
  filterValue,
  onFilterChange,
}: SchemaDetailColumnFilterTitleProps) => {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState('');

  const commit = (value: string) => {
    const nextValue = value.trim() || undefined;
    onFilterChange(filterKey, nextValue);
    setExpanded(false);
  };

  const toggleExpanded = () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setDraft(filterValue ?? '');
    setExpanded(true);
  };

  const hasFilter = Boolean(filterValue);
  const showCloseIcon = expanded;

  const triggerButton = (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={showCloseIcon ? `Close ${title} filter` : `Filter ${title}`}
      onClick={toggleExpanded}
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded transition-colors hover:text-foreground dark:hover:text-dark-foreground',
        (hasFilter || showCloseIcon) && 'text-primary',
        !hasFilter &&
          !showCloseIcon &&
          'text-foreground/45 dark:text-dark-foreground/45',
      )}
    >
      {showCloseIcon ? (
        <IconX className="size-4 shrink-0" aria-hidden />
      ) : (
        <IconSearch className="size-3.5 shrink-0" aria-hidden />
      )}
    </button>
  );

  return (
    <div
      className={cn(
        'flex w-full min-w-0 items-center',
        expanded ? 'gap-1.5' : 'justify-between gap-2',
      )}
    >
      {expanded ? (
        <>
          {triggerButton}
          <Input.Search
            size="small"
            className="min-w-0 flex-1"
            placeholder="Filter"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onPressEnter={() => commit(draft)}
            onClear={() => {
              setDraft('');
              onFilterChange(filterKey, undefined);
              setExpanded(false);
            }}
            allowClear
            autoFocus
          />
        </>
      ) : (
        <>
          <span className="min-w-0 truncate">{title}</span>
          {triggerButton}
        </>
      )}
    </div>
  );
};

export const createSchemaDetailTextColumnFilter = <T extends object>(
  title: string,
  filterKey: SchemaDetailColumnFilterField,
  filterValue: string | undefined,
  onFilterChange: (
    filterKey: SchemaDetailColumnFilterField,
    value: string | undefined,
  ) => void,
): Pick<ColumnType<T>, 'title' | 'onHeaderCell'> => {
  return {
    title: (
      <SchemaDetailColumnFilterTitle
        title={title}
        filterKey={filterKey}
        filterValue={filterValue}
        onFilterChange={onFilterChange}
      />
    ),
    onHeaderCell: () => ({
      className: '!whitespace-normal [&]:w-full',
    }),
  };
};
