import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { CreateRoleDrawer } from '@/Settings/components/RoleManagement/CreateRoleDrawer';
import { useFetchInfiniteFilteredRoles } from '@/Settings/hooks/roles/useFetchInfiniteFilteredRoles';
import { IconInfoCircle, IconLock } from '@repo/dfe-icons';
import { Button, Input, Spin } from 'antd';
import { useState } from 'react';
import { RoleCard } from './RoleCard';

const ROLE_LIMIT = 3;
export const RoleManagement = () => {
  const [customRoleSearch, setCustomRoleSearch] = useState('');
  const {
    data: { items: customRoles, total: customRolesTotal },
    fetchNextPage: fetchCustomRolesNextPage,
    isLoading: isLoadingCustomRoles,
    refetch: refetchCustomRoles,
    error: errorCustomRoles,
  } = useFetchInfiniteFilteredRoles({
    resource_type: 'custom',
    per_page: ROLE_LIMIT,
    search: customRoleSearch,
  });

  const [coreRoleSearch, setCoreRoleSearch] = useState('');
  const {
    data: { items: coreRoles, total: coreRolesTotal },
    fetchNextPage: fetchCoreRolesNextPage,
    isLoading: isLoadingCoreRoles,
    refetch: refetchCoreRoles,
    error: errorCoreRoles,
  } = useFetchInfiniteFilteredRoles({
    resource_type: RESOURCE_TYPES.CORE,
    per_page: ROLE_LIMIT,
    search: coreRoleSearch,
  });

  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });
  return (
    <CustomScrollbar height={componentHeight}>
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
        <RbacProtected action={RbacProtected.rbacActions.role_read}>
          <RbacProtected.Unrestricted>
            {isLoadingCustomRoles && (
              <>
                <Spin /> <p className="sr-only">Loading custom roles</p>
              </>
            )}

            {errorCustomRoles && (
              <GenericErrorCard
                title="Error fetching custom roles"
                description={
                  errorCustomRoles.message ??
                  'Unexpected error fetching custom roles'
                }
              />
            )}

            {customRoles.length > 0 && (
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {customRoles?.map((role) => (
                  <li key={role.name.replaceAll(' ', '-')}>
                    <RoleCard refetch={refetchCustomRoles} role={role} />
                  </li>
                ))}
              </ul>
            )}

            {customRoles.length < customRolesTotal && (
              <Button
                type="link"
                className="text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary"
                onClick={() => fetchCustomRolesNextPage()}
              >
                Show more
              </Button>
            )}

            {!isLoadingCustomRoles &&
              !errorCustomRoles &&
              customRoles.length === 0 && (
                <NotificationCard
                  className="w-full"
                  description="No custom roles found"
                  icon={<IconInfoCircle />}
                />
              )}
          </RbacProtected.Unrestricted>
          <RbacProtected.Restricted>
            <NotificationCard
              className="w-full"
              title="You do not have sufficient permissions"
              description="Please contact your administrator to request access."
              icon={<IconInfoCircle />}
            />
          </RbacProtected.Restricted>
        </RbacProtected>
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
        <RbacProtected action={RbacProtected.rbacActions.role_read}>
          <RbacProtected.Unrestricted>
            {isLoadingCoreRoles && (
              <>
                <Spin /> <p className="sr-only">Loading core roles</p>
              </>
            )}

            {errorCoreRoles && (
              <GenericErrorCard
                title="Error fetching core roles"
                description={
                  errorCoreRoles.message ??
                  'Unexpected error fetching core roles'
                }
              />
            )}

            {coreRoles.length > 0 && (
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
            )}

            {coreRoles.length < coreRolesTotal && (
              <Button
                type="link"
                className="text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary"
                onClick={() => fetchCoreRolesNextPage()}
              >
                Show more
              </Button>
            )}

            {!isLoadingCoreRoles &&
              !errorCoreRoles &&
              coreRoles.length === 0 && (
                <NotificationCard
                  className="w-full"
                  description="No core roles found"
                  icon={<IconInfoCircle />}
                />
              )}
          </RbacProtected.Unrestricted>
          <RbacProtected.Restricted>
            <NotificationCard
              className="w-full"
              title="You do not have sufficient permissions"
              description="Please contact your administrator to request access."
              icon={<IconInfoCircle />}
            />
          </RbacProtected.Restricted>
        </RbacProtected>
      </SectionCard>
    </CustomScrollbar>
  );
};
