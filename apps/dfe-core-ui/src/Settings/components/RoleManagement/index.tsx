import { RESOURCE_TYPES } from '@/core/components/CreateSchemaForm/fieldType.constants';
import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { CreateRoleDrawer } from '@/Settings/components/RoleManagement/CreateRoleDrawer';
import { PagedList } from '@/Settings/components/PagedList';
import { useFetchInfiniteFilteredRoles } from '@/Settings/hooks/roles/useFetchInfiniteFilteredRoles';
import { useShowMore } from '@/Settings/hooks/useShowMore';
import { IconInfoCircle, IconLock } from '@repo/dfe-icons';
import { Input, Spin } from 'antd';
import { useState } from 'react';
import { RoleCard } from './RoleCard';

export const RoleManagement = () => {
  const [customRoleSearch, setCustomRoleSearch] = useState('');
  const customPaging = useShowMore();
  const {
    data: { items: customRoles },
    fetchNextPage: fetchCustomRolesNextPage,
    hasNextPage: hasMoreCustomPages,
    isFetchingNextPage: isFetchingCustomRoles,
    isLoading: isLoadingCustomRoles,
    error: errorCustomRoles,
  } = useFetchInfiniteFilteredRoles({
    resource_type: 'custom',
    page_size: customPaging.pageSize,
    search: customRoleSearch,
  });
  const custom = customPaging.view({
    isFetchingNextPage: isFetchingCustomRoles,
    fetchNextPage: fetchCustomRolesNextPage,
    hasNextPage: hasMoreCustomPages,
    items: customRoles,
  });

  const [coreRoleSearch, setCoreRoleSearch] = useState('');
  const corePaging = useShowMore();
  const {
    data: { items: coreRoles },
    fetchNextPage: fetchCoreRolesNextPage,
    hasNextPage: hasMoreCorePages,
    isFetchingNextPage: isFetchingCoreRoles,
    isLoading: isLoadingCoreRoles,
    error: errorCoreRoles,
  } = useFetchInfiniteFilteredRoles({
    resource_type: RESOURCE_TYPES.CORE,
    page_size: corePaging.pageSize,
    search: coreRoleSearch,
  });
  const core = corePaging.view({
    isFetchingNextPage: isFetchingCoreRoles,
    fetchNextPage: fetchCoreRolesNextPage,
    hasNextPage: hasMoreCorePages,
    items: coreRoles,
  });

  return (
    // CSS sizes the box before the first paint, so no scrollbar shows while JS measures the window.
    <div className="h-[calc(100dvh-100px)]">
      <CustomScrollbar>
        <SectionCard
          title="Configure a custom role"
          description="Configure a custom role and its permissions."
          rightTitleSlot={<CreateRoleDrawer />}
        />
        <SectionCard
          title="Manage roles"
          description="Manage custom roles and their permissions."
          rightTitleSlot={
            <Input.Search
              className="ml-auto w-60"
              placeholder="Search custom roles"
              onChange={(e) => {
                setCustomRoleSearch(e.target.value);
                customPaging.reset();
              }}
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

              {custom.visible.length > 0 && (
                <PagedList
                  hasMore={custom.hasMore}
                  loading={isFetchingCustomRoles}
                  onLoadMore={custom.loadMore}
                  onShowMore={customPaging.showMore}
                  scrolling={customPaging.scrolling}
                >
                  <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {custom.visible.map((role) => (
                      <li key={role.name.replaceAll(' ', '-')}>
                        <RoleCard role={role} />
                      </li>
                    ))}
                  </ul>
                </PagedList>
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
              onChange={(e) => {
                setCoreRoleSearch(e.target.value);
                corePaging.reset();
              }}
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

              {core.visible.length > 0 && (
                <PagedList
                  hasMore={core.hasMore}
                  loading={isFetchingCoreRoles}
                  onLoadMore={core.loadMore}
                  onShowMore={corePaging.showMore}
                  scrolling={corePaging.scrolling}
                >
                  <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {core.visible.map((role) => (
                      <li key={role.name.replaceAll(' ', '-')}>
                        <RoleCard role={role} />
                      </li>
                    ))}
                  </ul>
                </PagedList>
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
    </div>
  );
};
