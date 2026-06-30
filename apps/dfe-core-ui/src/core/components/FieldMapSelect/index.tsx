import { useFetchInfiniteFilteredFieldMaps } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 50;

export const FieldMapSelect = (props: SelectProps) => {
  const [search, setSearch] = useState<string>('');
  const {
    data: { items: fieldMaps = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredFieldMaps({
    search: search,
    sort_by: 'standard',
    sort_order: 'asc',
  });

  const handlePopupScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom =
      scrollTop + clientHeight >= scrollHeight - SCROLL_LOAD_THRESHOLD;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const fieldMapsOptions = useMemo(() => {
    return fieldMaps.map((fieldMap) => ({
      label: `${fieldMap.standard}: ${fieldMap.source ?? '_default'}`,
      value: `${fieldMap.standard}/${fieldMap.source ?? '_default'}`,
    }));
  }, [fieldMaps]);

  return (
    <Select
      placeholder="Select field map"
      {...props}
      showSearch={{ onSearch: setSearch }}
      options={fieldMapsOptions}
      onPopupScroll={handlePopupScroll}
    />
  );
};
