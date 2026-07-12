import { useFetchInfiniteFilteredOrganisations } from '@/core/hooks/useFetchInfiniteFilteredOrganisations';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

interface OrganisationSelectProps extends SelectProps {
  currentOrganisation?: string;
}

const SCROLL_LOAD_THRESHOLD = 4;

export const OrganisationSelect = ({
  currentOrganisation,
  ...props
}: OrganisationSelectProps) => {
  const [search, setSearch] = useState('');
  const {
    data: { items: organisations = [] },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,

    isLoading,
    error,
  } = useFetchInfiniteFilteredOrganisations({ search });

  const options = useMemo(() => {
    return organisations
      ?.filter((organisation) => organisation.name !== currentOrganisation)
      .map((organisation) => ({
        label: organisation.display_name,
        value: organisation.name,
      }));
  }, [organisations, currentOrganisation]);

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
    <div className="flex flex-col gap-2">
      <Select
        loading={isLoading}
        disabled={isLoading || !!error}
        options={options}
        placeholder="Select organisation"
        onPopupScroll={handlePopupScroll}
        showSearch={{
          onSearch: setSearch,
        }}
        {...props}
      />
      {error && <div className="text-error text-sm">{error.message}</div>}
    </div>
  );
};
