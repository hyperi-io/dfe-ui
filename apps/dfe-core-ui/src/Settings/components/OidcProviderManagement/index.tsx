import { CustomScrollbar } from '@/core/components/CustomScrollbar';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { SectionCard } from '@/core/components/SectionCard';
import { useSetComponentHeight } from '@/core/hooks/useSetComponentHeight';
import { IconInfoCircle } from '@repo/dfe-icons';
import { CreateOidcProviderDrawer } from './CreateOidcProviderDrawer';
import { OidcProviderList } from './OidcProviderList';

export const OidcProviderManagement = () => {
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
    </CustomScrollbar>
  );
};
