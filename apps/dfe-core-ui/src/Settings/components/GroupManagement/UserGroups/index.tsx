'use client';

import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { CreateGroupDrawer } from '@/Settings/components/GroupManagement/CreateGroupDrawer';
import { GroupCard } from '@/Settings/components/GroupManagement/GroupCard';
import { SectionCard } from '@/Settings/components/SectionCard';
import { useFetchInfiniteFilteredGroups } from '@/Settings/hooks/useFetchInfiniteFilteredGroups';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Button, Input, Spin } from 'antd';
import { useState } from 'react';

const GROUP_LIMIT = 6;

export const UserGroups = () => {
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(GROUP_LIMIT);
  const {
    data: { items: groups = [] },
    isLoading,
    error,
    refetch,
  } = useFetchInfiniteFilteredGroups({
    search,
  });

  const visibleGroups = groups.slice(0, visibleCount);
  const hasMore = visibleGroups.length < groups.length;

  return (
    <div className="h-full css-custom-scrollbar">
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
              setVisibleCount(GROUP_LIMIT);
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
              <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {visibleGroups.map((group) => (
                  <li key={group.name}>
                    <GroupCard group={group} refetch={refetch} />
                  </li>
                ))}
              </ul>
            )}
            {hasMore && (
              <Button
                type="link"
                className="text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary"
                onClick={() => setVisibleCount((count) => count + GROUP_LIMIT)}
              >
                Show more
              </Button>
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
    </div>
  );
};
