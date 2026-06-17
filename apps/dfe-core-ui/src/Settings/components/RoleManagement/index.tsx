import { CreateRoleDrawer } from '@/Settings/components/RoleManagement/CreateRoleDrawer';
import { SectionCard } from '@/Settings/components/SectionCard';
import { useFetchInfiniteFilteredRoles } from '@/Settings/hooks/useFetchInfiniteFilteredRoles';
import { IconLock } from '@repo/dfe-icons';
import { Button, Input } from 'antd';
import { useState } from 'react';
import { RoleCard } from './RoleCard';

const ROLE_LIMIT = 6;
export const RoleManagement = () => {
  const [customRoleSearch, setCustomRoleSearch] = useState('');
  const {
    data: { items: customRoles, total: customRolesTotal },
    fetchNextPage: fetchCustomRolesNextPage,
    refetch: refetchCustomRoles,
  } = useFetchInfiniteFilteredRoles({
    resource_type: 'custom',
    per_page: ROLE_LIMIT,
    search: customRoleSearch,
  });

  const [coreRoleSearch, setCoreRoleSearch] = useState('');
  const {
    data: { items: coreRoles, total: coreRolesTotal },
    fetchNextPage: fetchCoreRolesNextPage,
    refetch: refetchCoreRoles,
  } = useFetchInfiniteFilteredRoles({
    resource_type: 'core',
    per_page: ROLE_LIMIT,
    search: coreRoleSearch,
  });
  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
      <SectionCard
        title="Configure a custom role"
        description="Configure a custom role and its permissions."
        rightTitleSlot={<CreateRoleDrawer refetch={refetchCustomRoles} />}
      />
      <SectionCard
        title="Manage roles"
        description="Manage custom roles and their permissions."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search custom roles"
            onChange={(e) => setCustomRoleSearch(e.target.value)}
            value={customRoleSearch}
            allowClear
          />
        }
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customRoles?.map((role) => (
            <li key={role.name.replaceAll(' ', '-')}>
              <RoleCard refetch={refetchCustomRoles} role={role} />
            </li>
          ))}
        </ul>
        {customRoles.length < customRolesTotal && (
          <Button
            type="link"
            className="text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary"
            onClick={() => fetchCustomRolesNextPage()}
          >
            Show more
          </Button>
        )}
      </SectionCard>
      <SectionCard
        title={
          <span className="flex items-center gap-2">
            <IconLock /> Core roles
          </span>
        }
        description="View configured roles and their permissions."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search predefined roles"
            onChange={(e) => setCoreRoleSearch(e.target.value)}
            value={coreRoleSearch}
            allowClear
          />
        }
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {coreRoles?.map((role) => (
            <li key={role.name.replaceAll(' ', '-')}>
              <RoleCard
                refetch={() => {
                  refetchCoreRoles();
                  refetchCustomRoles();
                }}
                role={role}
              />
            </li>
          ))}
        </ul>
        {coreRoles.length < coreRolesTotal && (
          <Button
            type="link"
            className="text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary"
            onClick={() => fetchCoreRolesNextPage()}
          >
            Show more
          </Button>
        )}
      </SectionCard>
    </div>
  );
};
