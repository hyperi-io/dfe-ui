'use client';

import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { orgOfRoleGroup } from '@/core/helpers/orgRoles';
import { useFetchInfiniteFilteredGroups } from '@/core/hooks/useFetchInfiniteFilteredGroups';
import { CreateGroupDrawer } from '@/Settings/components/GroupManagement/CreateGroupDrawer';
import { GroupCard } from '@/Settings/components/GroupManagement/GroupCard';
import { PagedList } from '@/Settings/components/PagedList';
import { SHOW_ALL_PAGE_SIZE, useShowMore } from '@/Settings/hooks/useShowMore';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input, Spin } from 'antd';
import { useState } from 'react';

export const UserGroups = () => {
  const [search, setSearch] = useState('');
  const paging = useShowMore();

  // Read whole, since the organisations' role groups are dropped below and a page could otherwise come back near empty.
  const {
    data: { items: groups = [] },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchInfiniteFilteredGroups({
    search,
    page_size: SHOW_ALL_PAGE_SIZE,
    sort_by: 'name',
    sort_order: 'asc',
  });
  // Each organisation's admin and viewer groups follow its accounts' roles, so they are listed in its Users tab instead.
  const shown = groups.filter((group) => orgOfRoleGroup(group) === null);
  const { hasMore, loadMore, visible } = paging.view({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items: shown,
  });

  return (
    <>
      <SectionCard
        title="Configure a new group"
        description="Create a group and assign roles to its members."
        rightTitleSlot={<CreateGroupDrawer />}
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
              paging.reset();
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
            {!isLoading && !error && visible.length === 0 && (
              <NotificationCard
                className="w-full"
                description="No groups found"
                icon={<IconInfoCircle />}
              />
            )}
            {visible.length > 0 && (
              <PagedList
                hasMore={hasMore}
                loading={isFetchingNextPage}
                onLoadMore={loadMore}
                onShowMore={paging.showMore}
                scrolling={paging.scrolling}
              >
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {visible.map((group) => (
                    <li key={group.name}>
                      <GroupCard group={group} />
                    </li>
                  ))}
                </ul>
              </PagedList>
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
    </>
  );
};
