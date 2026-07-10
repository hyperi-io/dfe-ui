import { CreateSchemaDrawer } from '@/core/components/CreateSchemaDrawer';
import { ListSchemasProvider } from '@/core/contexts/ListSchemasContext';
import { useFetchInfiniteFilteredSchemas } from '@/core/hooks/useFetchInfiniteFilteredSchemas';
import {
  getSchemaLeafName,
  getSchemaPathPrefix,
  isSelectableSchemaOptionValue,
  schemasToGroupedSelectOptions,
  versionsFromMetaSchemaOutput,
} from '@/Sources/components/CreateUpdateSourceForm/SchemaConfigTabContent/helpers/schemaSelectOptions';
import { Select, SelectProps, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 50;

const renderSelectedSchemaLabel = (fullPath: string) => {
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

interface MetaSchemaSelectCreateProps extends Omit<SelectProps, 'onChange'> {
  onChange?: (
    value: string | null,
    meta?: { versions: string[] },
    action_type?: string,
  ) => void;
}

export const MetaSchemaSelectCreate = ({
  value,
  onChange,
  onOpenChange,
  ...props
}: MetaSchemaSelectCreateProps) => {
  const [schemaValue, setSchemaValue] = useState<string | null>(value ?? null);
  const [searchValue, setSearchValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const {
    data: { items: schemas },
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchSchemas,
  } = useFetchInfiniteFilteredSchemas({
    search: searchValue,
    schema_type: ['meta'],
  });

  const schemaSelectOptions = useMemo(() => {
    const base = schemasToGroupedSelectOptions(schemas ?? []);

    if (!isFetchingNextPage) {
      return base;
    }

    return [
      ...base,
      {
        label: (
          <span className="flex items-center gap-2 text-sm text-foreground/50 dark:text-dark-foreground/50">
            <Spin size="small" />{' '}
            <span className="sr-only">Loading more schemas...</span>
          </span>
        ),
        value: '__loading__',
        disabled: true,
      },
    ];
  }, [schemas, isFetchingNextPage]);

  // Loads current schema versions if value is provided
  const initialSchema = schemas.find((schema) => schema.name === value);
  const onLoad = useCallback(() => {
    if (initialSchema) {
      onChange?.(
        initialSchema.name,
        {
          versions: initialSchema.versions ?? [],
        },
        '_load',
      );
    }
  }, [initialSchema, onChange]);

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

  const applySchemaSelection = useCallback(
    (selectedValue: string, versionsOverride?: string[]) => {
      if (!isSelectableSchemaOptionValue(selectedValue)) {
        return;
      }

      setSchemaValue(selectedValue);
      setSearchValue('');
      onChange?.(
        selectedValue,
        {
          versions:
            versionsOverride ??
            schemas.find((schema) => schema.name === selectedValue)?.versions ??
            [],
        },
        '_select',
      );
    },
    [onChange, schemas],
  );

  const handleSelectFromDropdown = useCallback(
    (selectedValue: string) => {
      applySchemaSelection(selectedValue);
    },
    [applySchemaSelection],
  );

  const handleSearchClear = useCallback(() => {
    setSearchValue('');
    onChange?.(schemaValue, undefined, '_clear_search');
  }, [onChange, schemaValue]);

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
    schemaValue && !dropdownOpen && searchValue === '',
  );

  const selectedLabel = useMemo(() => {
    if (!showSelectedLabel || !schemaValue) {
      return null;
    }
    return renderSelectedSchemaLabel(schemaValue);
  }, [schemaValue, showSelectedLabel]);

  return (
    <div className="flex min-w-0 flex-1 gap-2">
      <Select
        {...props}
        className="min-w-0 flex-1"
        loading={isLoading}
        options={schemaSelectOptions}
        placeholder="Select meta schema"
        showSearch={{
          onSearch: setSearchValue,
          searchValue,
          autoClearSearchValue: false,
        }}
        virtual={false}
        value={schemaValue ?? undefined}
        labelRender={() => selectedLabel}
        onOpenChange={handleOpenChange}
        onSelect={handleSelectFromDropdown}
        onPopupScroll={handlePopupScroll}
        allowClear={searchValue !== ''}
        onClear={handleSearchClear}
      />
      <ListSchemasProvider schemaTypes={['meta']}>
        <CreateSchemaDrawer
          onSuccess={(response) => {
            void refetchSchemas();
            applySchemaSelection(
              response.path ?? '',
              versionsFromMetaSchemaOutput(response),
            );
          }}
        />
      </ListSchemasProvider>
    </div>
  );
};
