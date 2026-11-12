import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchInfiniteFilteredHunts } from '@/core/hooks/useFetchInfiniteFilteredHunts';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 4;

export const HuntSelect = ({ ...props }: SelectProps) => {
  const [search, setSearch] = useState('');
  const {
    data: { items: hunts = [] },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchInfiniteFilteredHunts({ search });

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
      hunts?.map((hunt) => ({
        label: hunt.display_name,
        value: hunt.name,
      })) ?? []
    );
  }, [hunts]);

  return (
    <RbacProtected action={RbacProtected.rbacActions.hunt_read}>
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
