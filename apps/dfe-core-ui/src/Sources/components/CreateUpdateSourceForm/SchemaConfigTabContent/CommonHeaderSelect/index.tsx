import { useFetchInfiniteFilteredSchemas } from '@/core/hooks/useFetchInfiniteFilteredSchemas';
import {
  getSchemaLeafName,
  getSchemaPathPrefix,
  isSelectableSchemaOptionValue,
  schemasToGroupedSelectOptions,
} from '@/Sources/components/CreateUpdateSourceForm/SchemaConfigTabContent/helpers/schemaSelectOptions';
import { Select, SelectProps, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 0;

const renderSelectedCommonHeaderLabel = (fullPath: string) => {
  const pathPrefix = getSchemaPathPrefix(fullPath);
  const leafName = getSchemaLeafName(fullPath);

  return (
    <span
      className={
        pathPrefix
          ? 'before:content-[attr(data-path-prefix)] before:text-foreground/45 dark:before:text-dark-foreground/45'
          : undefined
      }
      data-path-prefix={pathPrefix || undefined}
    >
      {leafName}
    </span>
  );
};

interface CommonHeaderSelectProps extends Omit<SelectProps, 'onChange'> {
  onChange?: (
    value: string | null,
    meta?: { versions: string[] },
    action_type?: string,
  ) => void;
}

export const CommonHeaderSelect = ({
  value,
  onChange,
  onOpenChange,
  ...props
}: CommonHeaderSelectProps) => {
  const [commonHeaderValue, setCommonHeaderValue] = useState<string | null>(
    value ?? null,
  );
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (value && value !== commonHeaderValue) {
    setCommonHeaderValue(value);
  }

  const {
    data: { items: commonHeaders },
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredSchemas({
    search: searchValue,
    per_page: -1,
    schema_type: ['common-header'],
  });

  const commonHeaderSelectOptions = useMemo(() => {
    const base = schemasToGroupedSelectOptions(commonHeaders ?? []);

    if (!isFetchingNextPage) {
      return base;
    }

    return [
      ...base,
      {
        label: (
          <span className="flex items-center gap-2 text-sm text-foreground/50 dark:text-dark-foreground/50">
            <Spin size="small" />{' '}
            <span className="sr-only">Loading more common headers...</span>
          </span>
        ),
        value: '__loading__',
        disabled: true,
      },
    ];
  }, [commonHeaders, isFetchingNextPage]);

  // Loads current common header versions if value is provided
  const initialCommonHeader = commonHeaders.find(
    (commonHeader) => commonHeader.name === value,
  );
  const onLoad = useCallback(() => {
    if (initialCommonHeader) {
      onChange?.(
        initialCommonHeader.name,
        {
          versions: initialCommonHeader.versions ?? [],
        },
        '_load',
      );
    }
  }, [initialCommonHeader, onChange]);

  useEffect(() => {
    onLoad();
  }, [onLoad]);

  const handlePopupScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = target;
      const isNearBottom =
        scrollTop + clientHeight >= scrollHeight - SCROLL_LOAD_THRESHOLD;

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  );

  const applyCommonHeaderSelection = useCallback(
    (selectedValue: string, versionsOverride?: string[]) => {
      if (!isSelectableSchemaOptionValue(selectedValue)) {
        return;
      }

      setCommonHeaderValue(selectedValue);
      setSearchValue('');
      onChange?.(
        selectedValue,
        {
          versions:
            versionsOverride ??
            commonHeaders.find(
              (commonHeader) => commonHeader.name === selectedValue,
            )?.versions ??
            [],
        },
        '_select',
      );
    },
    [onChange, commonHeaders],
  );

  const handleSelectFromDropdown = useCallback(
    (selectedValue: string) => {
      applyCommonHeaderSelection(selectedValue);
    },
    [applyCommonHeaderSelection],
  );

  const handleSearchClear = useCallback(() => {
    setSearchValue('');
    onChange?.(commonHeaderValue, undefined, '_clear_search');
  }, [onChange, commonHeaderValue]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      setDropdownOpen(open);
      if (!open) {
        setSearchValue('');
      }
      onOpenChange?.(open);
    },
    [onOpenChange],
  );

  const showSelectedLabel = Boolean(
    commonHeaderValue && !dropdownOpen && searchValue === '',
  );

  const selectedLabel = useMemo(() => {
    if (!showSelectedLabel || !commonHeaderValue) {
      return null;
    }
    return renderSelectedCommonHeaderLabel(commonHeaderValue);
  }, [commonHeaderValue, showSelectedLabel]);

  return (
    <div className="flex min-w-0 flex-1 gap-2">
      <Select
        {...props}
        className="min-w-0 flex-1"
        loading={isLoading}
        options={commonHeaderSelectOptions}
        placeholder="Select common header"
        showSearch={{
          onSearch: setSearchValue,
          searchValue,
          autoClearSearchValue: false,
        }}
        virtual={false}
        value={commonHeaderValue ?? undefined}
        labelRender={() => selectedLabel}
        onOpenChange={handleOpenChange}
        onSelect={handleSelectFromDropdown}
        onPopupScroll={handlePopupScroll}
        allowClear={searchValue !== ''}
        onClear={handleSearchClear}
      />
    </div>
  );
};
