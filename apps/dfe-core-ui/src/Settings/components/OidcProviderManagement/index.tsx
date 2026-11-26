import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useAdministeredOrg } from '@/core/hooks/useAdministeredOrg';
import { useAuthMe } from '@/core/hooks/useAuthMe';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input } from 'antd';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { CreateOidcProviderDrawer } from './CreateOidcProviderDrawer';
import { OidcProviderList } from './OidcProviderList';

const SECTIONS = {
  customer: {
    description:
      "Providers that sign in a customer organisation's accounts, grouped by organisation.",
    placeholder: 'Search customer providers',
    title: 'Customer OIDC providers',
  },
  yours: {
    description: "Providers that sign in your organisation's accounts.",
    placeholder: 'Search providers',
    title: "Your organisation's OIDC providers",
  },
};

/** One scope's providers, with its own search and the button that creates one in it. */
const ProviderSection = ({ scope }: { scope: 'customer' | 'yours' }) => {
  const [search, setSearch] = useState('');
  // An organisation's OIDC Providers tab links here with ?org= to open its providers' drawer over the whole list.
  const [openOrg, setOpenOrg] = useState(
    useSearchParams().get('org') ?? undefined,
  );
  const section = SECTIONS[scope];
  return (
    <SectionCard
      title={section.title}
      description={section.description}
      rightTitleSlot={
        <div className="ml-auto flex gap-2">
          <Input.Search
            className="w-60"
            placeholder={section.placeholder}
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            allowClear
          />
          <CreateOidcProviderDrawer scope={scope} />
        </div>
      }
    >
      <RbacProtected action={RbacProtected.rbacActions.oidc_read}>
        <RbacProtected.Unrestricted>
          <OidcProviderList
            onOrgClosed={() => setOpenOrg(undefined)}
            openOrg={scope === 'customer' ? openOrg : undefined}
            scope={scope}
            search={search}
          />
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
  );
};

export const OidcProviderManagement = () => {
  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });
  // An org admin's providers are its organisation's only, so customers show once the account says it is not one.
  const { data: me } = useAuthMe();
  const administeredOrg = useAdministeredOrg();
  return (
    <CustomScrollbar height={componentHeight}>
      <ProviderSection scope="yours" />
      {me && !administeredOrg && <ProviderSection scope="customer" />}
    </CustomScrollbar>
  );
};
