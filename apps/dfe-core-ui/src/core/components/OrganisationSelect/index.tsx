import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchInfiniteFilteredOrganisations } from '@/core/hooks/useFetchInfiniteFilteredOrganisations';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 4;

export const OrganisationSelect = ({ ...props }: SelectProps) => {
  const [search, setSearch] = useState('');
  const {
    data: { items: organisations = [] },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchInfiniteFilteredOrganisations({ search });

  const handlePopupScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = target;
    const isNearBottom =
      scrollTop + clientHeight >= scrollHeight - SCROLL_LOAD_THRESHOLD;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const options = useMemo(() => {
    return (
      organisations?.map((organisation) => ({
        label: organisation.display_name,
        value: organisation.name,
      })) ?? []
    );
  }, [organisations]);

  return (
    <RbacProtected action={RbacProtected.rbacActions.org_read}>
      <RbacProtected.Unrestricted>
        <Select
          {...props}
          options={options}
          loading={isLoading}
          disabled={isLoading || !!error}
          showSearch={{
            onSearch: setSearch,
          }}
          onPopupScroll={handlePopupScroll}
        />
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted tooltip={{ show: true }}>
        <Select disabled {...props} />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
