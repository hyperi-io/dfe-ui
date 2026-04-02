'use client';

import { CreateOrganisationDrawer } from '@/Settings/components/CreateOrganisationDrawer';
import { SectionCard } from '@/Settings/components/SectionCard';
import { ORGANISATION_LIST_RESPONSE } from '@/Settings/mocks/organisation.data';
import { Button, Input } from 'antd';
import { useState } from 'react';
import { OrganisationCard } from './OrganisationCard';
import { SpendLimitsContent } from './SpendLimitsContent';

export const OrganisationManagement = () => {
  const [search, setSearch] = useState('');
  const [companyLimit, setCompanyLimit] = useState(4);
  const filteredOrganisations = ORGANISATION_LIST_RESPONSE.filter(
    (organisation) =>
      organisation.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
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
            onChange={(e) => setSearch(e.target.value)}
            value={search}
          />
        }
      >
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredOrganisations.slice(0, companyLimit).map((organisation) => (
            <li key={organisation.id}>
              <OrganisationCard
                key={organisation.id}
                organisation={organisation}
              />
            </li>
          ))}
        </ul>
        {companyLimit < filteredOrganisations.length && (
          <Button
            type="link"
            className="text-foreground-muted dark:text-dark-foreground-muted text-sm hover:text-tertiary"
            onClick={() => setCompanyLimit(companyLimit + 4)}
          >
            Show more
          </Button>
        )}
      </SectionCard>
      <SectionCard
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
      </SectionCard>
    </div>
  );
};
