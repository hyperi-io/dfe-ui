import { SectionCard } from '@/Settings/components/SectionCard';
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
        <OidcProviderList />
      </SectionCard>
    </div>
  );
};
