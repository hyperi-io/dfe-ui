import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchGroups } from '@/Settings/hooks/useFetchGroups';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

export const AccountGroupSelect = (props: SelectProps) => {
  const [search, setSearch] = useState('');
  const { data: groups = [], isLoading, error } = useFetchGroups();

  const options = useMemo(() => {
    const query = search.trim().toLowerCase();
    return groups
      .filter((group) => !query || group.name.toLowerCase().includes(query))
      .map((group) => ({
        label: group.name,
        value: group.name,
      }));
  }, [groups, search]);

  return (
    <RbacProtected action={RbacProtected.rbacActions.group_read}>
      <RbacProtected.Unrestricted>
        <div className="flex flex-col gap-2">
          <Select
            loading={isLoading && groups.length === 0}
            disabled={!!error}
            options={options}
            placeholder="Select groups"
            showSearch={{
              onSearch: setSearch,
              filterOption: false,
            }}
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
