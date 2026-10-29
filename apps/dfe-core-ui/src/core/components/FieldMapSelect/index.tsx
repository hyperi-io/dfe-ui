import { useFetchInfiniteFilteredFieldMaps } from '@/core/hooks/useFetchInfiniteFilteredFieldMaps';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 50;

/** The engine's field_map pin, `{standard}/{source}`, with `_default` naming a standard's base map. */
export const fieldMapPin = ({
  standard,
  source,
}: {
  standard: string;
  source?: string | null;
}) => `${standard}/${source ?? '_default'}`;

/** The picker's label for a field map, `{standard}: {source}`. */
export const fieldMapLabel = ({
  standard,
  source,
}: {
  standard: string;
  source?: string | null;
}) => `${standard}: ${source ?? '_default'}`;

/** A pin's label read off the pin itself, so a map on a page not yet fetched still shows its label. */
const renderPinLabel: SelectProps['labelRender'] = ({ label, value }) => {
  if (label !== undefined && label !== value) return label;
  if (typeof value !== 'string') return value;
  const slash = value.indexOf('/');
  return slash > 0
    ? fieldMapLabel({
        standard: value.slice(0, slash),
        source: value.slice(slash + 1),
      })
    : value;
};

interface FieldMapSelectProps extends SelectProps {
  /** Offers only this standard's maps when set. */
  standard?: string;
}

export const FieldMapSelect = ({ standard, ...props }: FieldMapSelectProps) => {
  const [search, setSearch] = useState<string>('');
  const {
    data: { items: fieldMaps = [] } = {},
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredFieldMaps({
    search: search,
    standard: standard || undefined,
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
      label: fieldMapLabel(fieldMap),
      value: fieldMapPin(fieldMap),
    }));
  }, [fieldMaps]);

  return (
    <Select
      placeholder="Select field map"
      labelRender={renderPinLabel}
      {...props}
      showSearch={{ onSearch: setSearch }}
      options={fieldMapsOptions}
      onPopupScroll={handlePopupScroll}
    />
  );
};
