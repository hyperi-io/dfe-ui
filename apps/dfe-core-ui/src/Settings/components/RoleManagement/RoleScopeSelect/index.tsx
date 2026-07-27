import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchInfiniteFilteredRoleScopes } from '@/Settings/hooks/roles/useFetchInfiniteFilteredRoleScopes';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

const SCROLL_LOAD_THRESHOLD = 5;

export const RoleScopeSelect = (props: SelectProps) => {
  const [search, setSearch] = useState<string>('');
  const {
    data: { scopes: roleScopes = [] } = {},
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredRoleScopes({
    search,
  });

  const options = useMemo(
    () =>
      roleScopes.map((roleScope) => ({
        label: roleScope,
        value: roleScope,
      })),
    [roleScopes],
  );

  const isInitialLoading = isLoading && roleScopes.length === 0;

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
    <RbacProtected action={RbacProtected.rbacActions.role_scopes}>
      <RbacProtected.Unrestricted>
        <div className="flex flex-col gap-2">
          <Select
            loading={isInitialLoading}
            disabled={!!error}
            options={options}
            placeholder="Select scopes"
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
      </RbacProtected.Unrestricted>
      <RbacProtected.Restricted>
        <NotificationCard
          className="w-full"
          title="You do not have sufficient permissions"
          description="Please contact your administrator to request access."
        />
      </RbacProtected.Restricted>
    </RbacProtected>
  );
};
