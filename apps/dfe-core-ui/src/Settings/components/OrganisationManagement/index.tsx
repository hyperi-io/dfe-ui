'use client';

import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { PagedList } from '@/Settings/components/PagedList';
import { useFetchInfiniteFilteredOrganisations } from '@/core/hooks/useFetchInfiniteFilteredOrganisations';
import { useFetchYourOrganisation } from '@/core/hooks/useFetchYourOrganisation';
import { useShowMore } from '@/Settings/hooks/useShowMore';
import { CreateOrganisationDrawer } from '@/Settings/components/OrganisationManagement/CreateOrganisationDrawer';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input, Spin } from 'antd';
import { useState } from 'react';
import { OrganisationCard } from './OrganisationCard';
import { YourOrganisationBanner } from './YourOrganisationBanner';

export const OrganisationManagement = () => {
  const [search, setSearch] = useState('');
  // One more per page, since your organisation is dropped from the grid below.
  const paging = useShowMore({ hidden: 1 });
  const {
    data: { items: organisations = [] },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
  } = useFetchInfiniteFilteredOrganisations({
    search,
    sort_by: 'display_name',
    sort_order: 'asc',
    page_size: paging.pageSize,
  });
  const { data: yourOrganisation } = useFetchYourOrganisation();
  // Your organisation has its own banner, so the grid holds the ones you serve.
  const servedOrganisations = organisations.filter(
    (organisation) => organisation.name !== yourOrganisation?.name,
  );
  const {
    hasMore,
    loadMore,
    visible: visibleOrganisations,
  } = paging.view({
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    items: servedOrganisations,
  });

  return (
    // CSS sizes the box before the first paint, so no scrollbar shows while JS measures the window.
    <div className="h-[calc(100dvh-100px)]">
      <CustomScrollbar>
        <YourOrganisationBanner />
        <SectionCard
          title="Configure a new organisation"
          description="Create and configure a new organisation and manage user, role defaults and more."
          rightTitleSlot={<CreateOrganisationDrawer />}
        />
        <SectionCard
          title="Manage existing organisations"
          description="Manage existing organisations and their configurations."
          rightTitleSlot={
            <Input.Search
              className="ml-auto w-60"
              placeholder="Search organisations"
              onChange={(e) => {
                setSearch(e.target.value);
                paging.reset();
              }}
              value={search}
              allowClear
              aria-label="Search organisations"
            />
          }
        >
          <RbacProtected action={RbacProtected.rbacActions.org_read}>
            <RbacProtected.Unrestricted>
              {isLoading && (
                <>
                  <Spin /> <p className="sr-only">Loading organisations</p>
                </>
              )}
              {error && (
                <>
                  <GenericErrorCard
                    title="Error fetching organisations"
                    description={error.message}
                  />
                </>
              )}
              {!isLoading && !error && servedOrganisations.length === 0 && (
                <NotificationCard
                  className="w-full"
                  description="No organisations found"
                  icon={<IconInfoCircle />}
                />
              )}
              {visibleOrganisations.length > 0 && (
                <PagedList
                  hasMore={hasMore}
                  loading={isFetchingNextPage}
                  onLoadMore={loadMore}
                  onShowMore={paging.showMore}
                  scrolling={paging.scrolling}
                >
                  <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {visibleOrganisations.map((organisation) => (
                      <li key={organisation.name}>
                        <OrganisationCard organisation={organisation} />
                      </li>
                    ))}
                  </ul>
                </PagedList>
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
        {/* <SectionCard
        className="mb-0"
        title={
          <span className="flex items-center gap-4">
            Spend limits and quotas{' '}
            <span className="text-foreground/50 dark:text-dark-foreground/50 text-xs">
              BETA
            </span>
          </span>
        }
        description="View and configure spend limits and quotas for each organisation."
      >
        <SpendLimitsContent />
      </SectionCard> */}
      </CustomScrollbar>
    </div>
  );
};
