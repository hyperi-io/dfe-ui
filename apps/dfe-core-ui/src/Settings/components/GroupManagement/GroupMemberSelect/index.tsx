import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchInfiniteFilteredAccounts } from '@/Settings/hooks/useFetchInfiniteFilteredAccounts';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

export const GroupMemberSelect = (props: SelectProps) => {
  const [search, setSearch] = useState('');
  const {
    data: { items: accounts = [] },
    isLoading,
    error,
  } = useFetchInfiniteFilteredAccounts({ search });

  const options = useMemo(() => {
    return accounts.map((account) => ({
      label: account.username,
      value: account.username,
    }));
  }, [accounts]);

  return (
    <RbacProtected action={RbacProtected.rbacActions.account_read}>
      <RbacProtected.Unrestricted>
        <div className="flex flex-col gap-2">
          <Select
            loading={isLoading && accounts.length === 0}
            disabled={!!error}
            options={options}
            placeholder="Select members"
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
