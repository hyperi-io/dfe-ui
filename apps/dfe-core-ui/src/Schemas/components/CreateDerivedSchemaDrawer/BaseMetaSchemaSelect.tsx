import { useFetchInfiniteFilteredSchemas } from '@/core/hooks/useFetchInfiniteFilteredSchemas';
import { Select, SelectProps } from 'antd';
import { useCallback, useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 50;

export interface BaseMetaSchemaSelectProps extends Omit<
  SelectProps,
  'onChange' | 'options'
> {
  onChange?: (value: string | null, meta: { versions: string[] }) => void;
}

/**
 * Picks the meta schema a derived schema selects its columns from.
 *
 * Deliberately not MetaSchemaSelectCreate: that one carries an Add Schema
 * drawer, and this select already sits inside a drawer.
 */
export const BaseMetaSchemaSelect = ({
  value,
  onChange,
  ...props
}: BaseMetaSchemaSelectProps) => {
  const [search, setSearch] = useState('');

  const {
    data: { items: schemas },
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredSchemas({
    search,
    schema_type: ['meta'],
  });

  const options = useMemo(
    () =>
      (schemas ?? []).map((schema) => ({
        label: schema.name,
        value: schema.name,
      })),
    [schemas],
  );

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
    (selected: string) => {
      setSearch('');
      onChange?.(selected, {
        versions:
          schemas.find((schema) => schema.name === selected)?.versions ?? [],
      });
    },
    [onChange, schemas],
  );

  return (
    <Select
      {...props}
      loading={isLoading}
      options={options}
      placeholder="Select base meta schema"
      showSearch={{
        onSearch: setSearch,
        searchValue: search,
        autoClearSearchValue: false,
      }}
      virtual={false}
      value={(value as string | undefined) ?? undefined}
      onSelect={handleSelect}
      onPopupScroll={handlePopupScroll}
    />
  );
};
