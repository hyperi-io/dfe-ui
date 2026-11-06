import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Input } from 'antd';
import { useState } from 'react';
import { CreateOidcProviderDrawer } from './CreateOidcProviderDrawer';
import { OidcProviderList } from './OidcProviderList';

export const OidcProviderManagement = () => {
  const [search, setSearch] = useState('');
  const { componentHeight } = useSetComponentHeight({
    offset: 100,
  });
  return (
    <CustomScrollbar height={componentHeight}>
      <SectionCard
        title="Configure a new OIDC provider"
        description="Create and configure a new OIDC provider and manage OIDC provider specific configurations and defaults."
        rightTitleSlot={
          <CreateOidcProviderDrawer title="Configure New OIDC Provider" />
        }
      />
      <SectionCard
        title="OIDC providers"
        description="Manage OIDC providers and their configurations."
        rightTitleSlot={
          <Input.Search
            className="ml-auto w-60"
            placeholder="Search providers"
            onChange={(e) => setSearch(e.target.value)}
            value={search}
            allowClear
          />
        }
      >
        <RbacProtected action={RbacProtected.rbacActions.oidc_read}>
          <RbacProtected.Unrestricted>
            <OidcProviderList search={search} />
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
