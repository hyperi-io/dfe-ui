import { Form } from '@/core/components/Form';
import { QUERY_KEYS } from '@/core/config/api/endpoints/queryKeys';
import { useDebounce } from '@/core/hooks/useDebounce';
import { useFetchInfiniteSourceCatalogues } from '@/core/hooks/useFetchInfiniteSourceCatalogues';
import { sourceCatalogues } from '@/core/hooks/useFetchInfiniteSourceCatalogues/api';
import { useQuery } from '@tanstack/react-query';
import {
  Select,
  type FormItemProps,
  type FormRule,
  type SelectProps,
} from 'antd';
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
  // The engine matches an entry without regard to case, as the catalogue filter does.
  const wanted = engine.toLowerCase();
  for (const entry of entries) {
    if (entry.engine?.toLowerCase() !== wanted) continue;
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
  // One entry of this engine's is enough, stored ones included, since a source
  // created from an entry still runs the entry's program.
  const queryParams = {
    engine: engine ?? '',
    include_stored: true,
    per_page: 1,
  };
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [...QUERY_KEYS.sources.catalogue(queryParams), 'count'],
    queryFn: ({ signal }) => sourceCatalogues({ queryParams, signal }),
    enabled: !!engine,
  });
  // The entry is checked as well as the count, so an engine that ignores the
  // filter cannot make every engine ask for a variant.
  const wanted = engine?.toLowerCase();
  return {
    offersVariants:
      !!wanted &&
      (data?.items ?? []).some(
        (entry) => entry.engine?.toLowerCase() === wanted,
      ),
    // Unknown until the catalogue answers, so a stored variant must survive the wait.
    isUnknown: isLoading || isError,
    catalogueError: error,
  };
};

/** The required Variant field, the same wherever a source picks its transform engine. */
export const TransformVariantFormItem = ({
  name,
  engine,
  rules = [],
}: {
  name: FormItemProps['name'];
  engine: string;
  rules?: FormRule[];
}) => (
  <Form.Item
    name={name}
    label="Variant"
    extra="The compiled-in program this transform runs. Without one it has nothing to run."
    rules={[...rules, { required: true, message: 'Variant is required' }]}
  >
    <TransformVariantSelect engine={engine} />
  </Form.Item>
);

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
    engine,
    include_stored: true,
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
