import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/Settings/components/SectionCard';
import { IconInfoCircle } from '@repo/dfe-icons';
import { AddOidcProviderSection } from './AddOidcProviderSection';
import { OidcProviderList } from './OidcProviderList';

export const OidcProviderManagement = () => {
  return (
    <div className="h-[calc(100vh-100px)] css-custom-scrollbar">
      <SectionCard
        title="Configure a new OIDC provider"
        description="Create and configure a new OIDC provider and manage OIDC provider specific configurations and defaults."
      >
        <AddOidcProviderSection />
      </SectionCard>
      <SectionCard
        title="OIDC providers"
        description="Manage OIDC providers and their configurations."
      >
        <RbacProtected action={RbacProtected.rbacActions.oidc_read}>
          <RbacProtected.Unrestricted>
            <OidcProviderList />
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
    </div>
  );
};
