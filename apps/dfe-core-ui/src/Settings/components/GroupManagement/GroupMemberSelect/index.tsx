import { useFetchAccounts } from '@/Settings/hooks/useFetchAccounts';
import { Select, SelectProps } from 'antd';
import { useMemo, useState } from 'react';

export const GroupMemberSelect = (props: SelectProps) => {
  const [search, setSearch] = useState('');
  const { data: accounts = [], isLoading, error } = useFetchAccounts();

  const options = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts
      .filter(
        (account) => !query || account.username.toLowerCase().includes(query),
      )
      .map((account) => ({
        label: account.username,
        value: account.username,
      }));
  }, [accounts, search]);

  return (
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
  );
};
