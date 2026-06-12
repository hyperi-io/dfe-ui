import { useFetchInfiniteFilteredSources } from '@/core/hooks/useFetchInfiniteFilteredSources';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 50;

export const SourceSelect = (props: SelectProps) => {
  const [search, setSearch] = useState<string>('');
  const {
    data: { items: sources = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredSources({
    search,
    enabled: true,
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

  const sourcesOptions = useMemo(() => {
    return sources.map((source) => ({
      label: source.name,
      value: source.name,
    }));
  }, [sources]);

  return (
    <Select
      placeholder="Select source"
      {...props}
      showSearch={{ onSearch: setSearch }}
      options={sourcesOptions}
      onPopupScroll={handlePopupScroll}
    />
  );
};
