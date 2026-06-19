'use client';

import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { CreateOrganisationDrawer } from '@/Settings/components/OrganisationManagement/CreateOrganisationDrawer';
import { SectionCard } from '@/Settings/components/SectionCard';
import { useFetchOrganisations } from '@/Settings/hooks/useFetchOrganisations';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';
import { OrganisationCard } from './OrganisationCard';

export const OrganisationManagement = () => {
  // const [search, setSearch] = useState('');
  const {
    data: organisations,
    isLoading,
    error,
    refetch,
  } = useFetchOrganisations();

  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
      <SectionCard
        title="Configure a new organisation"
        description="Create and configure a new organisation and manage user, role defaults and more."
        rightTitleSlot={<CreateOrganisationDrawer refetch={refetch} />}
      />
      <SectionCard
        title="Manage existing organisations"
        description="Manage existing organisations and their configurations."
        // rightTitleSlot={
        //   <Input.Search
        //     className="ml-auto w-60"
        //     placeholder="Search organisations"
        //     onChange={(e) => setSearch(e.target.value)}
        //     value={search}
        //   />
        // }
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
              </ul>
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
    </div>
  );
};
