'use client';

import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchInfiniteFilteredGroups } from '@/core/hooks/useFetchInfiniteFilteredGroups';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { CreateGroupDrawer } from '@/Settings/components/GroupManagement/CreateGroupDrawer';
import { GroupCard } from '@/Settings/components/GroupManagement/GroupCard';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input, Spin } from 'antd';
import { useState } from 'react';

export const UserGroups = () => {
  const [search, setSearch] = useState('');

  const {
    data: { items: groups = [] },
    isFetchingNextPage,
    loadMoreRef,
    isLoading,
    error,
    refetch,
  } = useFetchInfiniteFilteredGroups({
    search,
    per_page: 12,
  });

  const { componentHeight: outerComponentHeight } = useSetComponentHeight({
    offset: 100,
  });

  const { componentHeight: innerComponentHeight } = useSetComponentHeight({
    offset: 295,
  });

  return (
    <CustomScrollbar height={outerComponentHeight}>
      <SectionCard
        title="Configure a new group"
        description="Create a group and assign roles to its members."
        rightTitleSlot={<CreateGroupDrawer refetch={refetch} />}
      />
      <SectionCard
        title="Manage groups"
        description="Manage custom groups, roles, and members."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search groups"
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            value={search}
            allowClear
          />
        }
      >
        <RbacProtected action={RbacProtected.rbacActions.group_read}>
          <RbacProtected.Unrestricted>
            {isLoading && (
              <>
                <Spin /> <p className="sr-only">Loading groups</p>
              </>
            )}
            {error && (
              <GenericErrorCard
                title="Error fetching groups"
                description={error.message}
              />
            )}
            {!isLoading && !error && groups.length === 0 && (
              <NotificationCard
                className="w-full"
                description="No groups found"
                icon={<IconInfoCircle />}
              />
            )}
            {!isLoading && !error && groups.length > 0 && (
              <CustomScrollbar height={innerComponentHeight}>
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {groups.map((group) => (
                    <li key={group.name}>
                      <GroupCard group={group} refetch={refetch} />
                    </li>
                  ))}
                  <div ref={loadMoreRef} className="h-4 flex justify-center">
                    {isFetchingNextPage && <Spin size="small" />}
                  </div>
                </ul>
              </CustomScrollbar>
            )}
          </RbacProtected.Unrestricted>
          <RbacProtected.Restricted>
            <NotificationCard
              icon={<IconInfoCircle />}
              className="w-full"
              title="You do not have sufficient permissions"
              description="Please contact your administrator to request access."
            />
          </RbacProtected.Restricted>
        </RbacProtected>
      </SectionCard>
    </CustomScrollbar>
  );
};
