import { useFetchInfiniteFilteredFieldMaps } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps';
import { Select, SelectProps } from 'antd';
import uniqBy from 'lodash/uniqBy';
import { useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 50;

export const FieldMapSelect = (props: SelectProps) => {
  const [searchStandard, setSearchStandard] = useState<string>('');
  const {
    data: fieldMaps,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredFieldMaps({
    standard: searchStandard,
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

  return (
    <Select
      placeholder="Select field map"
      {...props}
      showSearch={{ onSearch: setSearchStandard }}
      options={uniqBy(fieldMaps.items, 'standard').map((fieldMap) => ({
        label: fieldMap.standard,
        value: fieldMap.standard,
      }))}
      onPopupScroll={handlePopupScroll}
    />
  );
};
