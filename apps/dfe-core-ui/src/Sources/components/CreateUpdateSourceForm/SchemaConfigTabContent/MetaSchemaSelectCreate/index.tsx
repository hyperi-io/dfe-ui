import { CreateSchemaDrawer } from '@/core/components/CreateSchemaDrawer';
import { useCreateSchema } from '@/core/hooks/useCreateSchema';
import { useFetchInfiniteFilteredSchemas } from '@/core/hooks/useFetchInfiniteFilteredSchemas';
import { Select, SelectProps, Spin } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 50;

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
  ...props
}: MetaSchemaSelectCreateProps) => {
  const [schemaValue, setSchemaValue] = useState<string | null>(value);
  const [searchValue, setSearchValue] = useState<string>(value);

  const { mutate: _createMetaSchema } = useCreateSchema();
  const {
    data: { items: schemas },
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchSchemas,
  } = useFetchInfiniteFilteredSchemas({
    search: searchValue,
  });
  const schemasOptions = useMemo(() => {
    const base =
      schemas?.map((schema) => ({
        label: schema.name,
        value: schema.name,
      })) ?? [];

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

  const handleSelect = useCallback(
    (value: string) => {
      setSchemaValue(value);
      onChange?.(
        value,
        {
          versions:
            schemas.find((schema) => schema.name === value)?.versions ?? [],
        },
        '_select',
      );
    },
    [onChange, schemas],
  );

  const handleSearchClear = useCallback(() => {
    setSearchValue('');
    onChange?.(schemaValue, undefined, '_clear_search');
  }, [onChange, schemaValue]);

  return (
    <div className="flex gap-2">
      <Select
        {...props}
        loading={isLoading}
        options={schemasOptions}
        placeholder="Select meta schema"
        showSearch={{
          onSearch: setSearchValue,
          searchValue,
          autoClearSearchValue: false,
        }}
        virtual={false}
        value={schemaValue}
        onSelect={handleSelect}
        onPopupScroll={handlePopupScroll}
        allowClear={searchValue !== ''}
        onClear={handleSearchClear}
      />
      <CreateSchemaDrawer
        onSuccess={(response) => {
          refetchSchemas();
          handleSelect(response.path ?? '');
        }}
      />
    </div>
  );
};
