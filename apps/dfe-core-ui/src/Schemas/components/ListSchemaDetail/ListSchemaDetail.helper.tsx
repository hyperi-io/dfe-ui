import { cn } from '@/core/utils/style';
import type { SchemaDetailColumnFilterField } from '@/Schemas/hooks/useFetchInfiniteSchemaDetailColumns/types';
import { IconCheck, IconSearch } from '@repo/dfe-icons';
import { Input } from 'antd';
import type { ColumnType } from 'antd/es/table';
import { useState } from 'react';
import Highlighter from 'react-highlight-words';

const nonePlaceholder = (
  <span className="text-foreground/40 dark:text-dark-foreground/40">None</span>
);

export const renderSchemaDetailFilteredCell = ({
  value,
  filterTerms,
  isSearchable,
}: {
  value: string | undefined;
  filterTerms: (string | undefined)[];
  isSearchable?: boolean;
}) => {
  if (!value) {
    return nonePlaceholder;
  }

  if (!isSearchable) {
    return value;
  }

  const searchWords = filterTerms
    .map((term) => term?.trim())
    .filter((term): term is string => Boolean(term));

  if (searchWords.length === 0) {
    return value;
  }

  return (
    <Highlighter
      highlightClassName="bg-yellow-200"
      searchWords={searchWords}
      autoEscape
      textToHighlight={value}
    />
  );
};

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
  const [filterTerm, setFilterTerm] = useState('');

  const toggleExpanded = () => {
    if (expanded) {
      setExpanded(false);
      return;
    }
    setFilterTerm(filterValue ?? '');
    setExpanded(true);
  };

  const hasFilter = Boolean(filterValue);
  const showSearchIcon = !expanded;

  const triggerButton = (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={showSearchIcon ? `Filter ${title}` : `Close ${title} filter`}
      onClick={toggleExpanded}
      className={cn(
        'inline-flex size-5 shrink-0 items-center justify-center rounded transition-colors hover:text-foreground dark:hover:text-dark-foreground',
        hasFilter && showSearchIcon && 'text-tertiary',
      )}
    >
      {showSearchIcon && (
        <IconSearch className="size-3.5 shrink-0" aria-hidden />
      )}
    </button>
  );

  const handleChange = (value: string) => {
    const nextValue = value.trim() || undefined;
    setFilterTerm(nextValue ?? '');
    onFilterChange(filterKey, nextValue);
  };

  const handleClear = () => {
    setFilterTerm('');
    setExpanded(false);
    onFilterChange(filterKey, undefined);
  };

  return (
    <div className="flex w-full min-w-0 items-center justify-between">
      {expanded ? (
        <Input.Search
          size="small"
          className="min-w-0 flex-1"
          placeholder="Filter"
          value={filterTerm}
          onChange={(event) => handleChange(event.target.value)}
          onClear={handleClear}
          onSearch={() => setExpanded(false)}
          enterButton={<IconCheck className="size-4 shrink-0" aria-hidden />}
          onPressEnter={() => setExpanded(false)}
          allowClear
          autoFocus
        />
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
  columnFilterResetKey: number,
  onFilterChange: (
    filterKey: SchemaDetailColumnFilterField,
    value: string | undefined,
  ) => void,
): Pick<ColumnType<T>, 'title' | 'onHeaderCell'> => {
  return {
    title: (
      <SchemaDetailColumnFilterTitle
        key={`${filterKey}-${columnFilterResetKey}`}
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
