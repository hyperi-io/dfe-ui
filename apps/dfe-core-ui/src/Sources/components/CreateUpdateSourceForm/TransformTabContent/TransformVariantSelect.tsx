import { useDebounce } from '@/core/hooks/useDebounce';
import { useFetchInfiniteSourceCatalogues } from '@/Sources/hooks/useFetchInfiniteSourceCatalogues';
import { Select, type SelectProps } from 'antd';
import { useMemo, useState } from 'react';

const SEARCH_DEBOUNCE_MS = 300;
const PAGE_SIZE = 50;
const SCROLL_LOAD_THRESHOLD = 4;

type CatalogueEntry = ReturnType<
  typeof useFetchInfiniteSourceCatalogues
>['data']['items'][number];

/** One option per variant the engine's catalogue entries compile to, labelled by the entry. */
export const variantOptions = (
  entries: CatalogueEntry[],
  engine: string,
  selected?: string | null,
) => {
  const seen = new Set<string>();
  const options: { label: string; value: string }[] = [];
  for (const entry of entries) {
    if (entry.engine !== engine) continue;
    for (const variant of entry.variants ?? []) {
      if (seen.has(variant)) continue;
      seen.add(variant);
      options.push({
        label: `${entry.display_name} (${variant})`,
        value: variant,
      });
    }
  }
  // A stored variant stays visible even when the current search leaves it out.
  if (selected && !seen.has(selected)) {
    options.unshift({ label: selected, value: selected });
  }
  return options;
};

/** Whether the catalogue offers compiled-in programs for *engine*, so a source on it must name one. */
export const useEngineOffersVariants = (engine?: string | null) => {
  const { data, isLoading, isError } = useFetchInfiniteSourceCatalogues({
    per_page: PAGE_SIZE,
  });
  return {
    offersVariants:
      !!engine && data.items.some((entry) => entry.engine === engine),
    // Unknown until the catalogue answers, so a stored variant must survive the wait.
    isUnknown: isLoading || isError,
  };
};

/** The compiled-in program a transform runs, searched across the source catalogue. */
export const TransformVariantSelect = ({
  engine,
  value,
  ...props
}: SelectProps<string> & { engine: string }) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const {
    data: { items },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useFetchInfiniteSourceCatalogues({
    search: debouncedSearch || undefined,
    per_page: PAGE_SIZE,
  });

  const options = useMemo(
    () => variantOptions(items, engine, value),
    [items, engine, value],
  );

  const handlePopupScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } =
      event.target as HTMLDivElement;
    if (
      scrollTop + clientHeight >= scrollHeight - SCROLL_LOAD_THRESHOLD &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      void fetchNextPage();
    }
  };

  return (
    <Select
      {...props}
      value={value}
      options={options}
      loading={isLoading || isFetchingNextPage}
      placeholder="Search the catalogue for a variant"
      showSearch={{ onSearch: setSearch, filterOption: false }}
      onPopupScroll={handlePopupScroll}
      allowClear
    />
  );
};
