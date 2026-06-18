import { useFetchInfiniteFilteredRoles } from '@/Settings/hooks/useFetchInfiniteFilteredRoles';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 5;
const ROLES_PER_PAGE = 20;

export const GroupRoleSelect = (props: SelectProps) => {
  const [search, setSearch] = useState<string>('');
  const {
    data: { items: roles = [] } = {},
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredRoles({
    search,
    per_page: ROLES_PER_PAGE,
  });

  const options = useMemo(
    () =>
      roles.map((role) => ({
        label: role.name,
        value: role.name,
      })),
    [roles],
  );

  const isInitialLoading = isLoading && roles.length === 0;

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
        loading={isInitialLoading}
        disabled={!!error}
        options={options}
        placeholder="Select roles"
        showSearch={{
          onSearch: setSearch,
        }}
        onPopupScroll={handlePopupScroll}
        mode="multiple"
        onSelect={() => {
          setSearch('');
        }}
        {...props}
      />
      {error && <div className="text-error text-sm">{error.message}</div>}
    </div>
  );
};
