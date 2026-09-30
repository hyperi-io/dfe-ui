'use client';

import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useFetchInfiniteFilteredOrganisations } from '@/core/hooks/useFetchInfiniteFilteredOrganisations';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { CreateOrganisationDrawer } from '@/Settings/components/OrganisationManagement/CreateOrganisationDrawer';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input, Spin } from 'antd';
import { useState } from 'react';
import { OrganisationCard } from './OrganisationCard';

export const OrganisationManagement = () => {
  const [search, setSearch] = useState('');
  const {
    data: { items: organisations = [] },
    isFetchingNextPage,
    loadMoreRef,
    isLoading,
    error,
    refetch,
  } = useFetchInfiniteFilteredOrganisations({ search, per_page: 12 });
  const { componentHeight: outerComponentHeight } = useSetComponentHeight({
    offset: 100,
  });

  const { componentHeight: innerComponentHeight } = useSetComponentHeight({
    offset: 295,
  });

  return (
    <CustomScrollbar height={outerComponentHeight}>
      <SectionCard
        title="Configure a new organisation"
        description="Create and configure a new organisation and manage user, role defaults and more."
        rightTitleSlot={<CreateOrganisationDrawer refetch={refetch} />}
      />
      <SectionCard
        title="Manage existing organisations"
        description="Manage existing organisations and their configurations."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search organisations"
            onChange={(e) => setSearch(e.target.value)}
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
            {!isLoading && !error && organisations?.length === 0 && (
              <NotificationCard
                className="w-full"
                description="No organisations found"
                icon={<IconInfoCircle />}
              />
            )}
            {organisations && organisations?.length > 0 && (
              <CustomScrollbar height={innerComponentHeight}>
                <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {organisations?.map((organisation) => (
                    <li key={organisation.name}>
                      <OrganisationCard
                        key={organisation.name}
                        organisation={organisation}
                        refetch={refetch}
                      />
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
  );
};
