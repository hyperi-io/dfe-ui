import { DeleteOidcProviderModal } from '@/Settings/components/OidcProviderManagement/DeleteOidcProviderModal';
import { SyncOidcProviderGroupsDrawer } from '@/Settings/components/OidcProviderManagement/SyncOidcProviderGroupsDrawer';
import { UpdateOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/UpdateOidcDrawer';
import { ViewOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/ViewOidcProviderDrawer';
import { PopoverMenu } from '@/Settings/components/PopoverMenu';
import { TOidcProviderListItem } from '@/Settings/hooks/useFetchInfiniteFilteredOidcProviders/types';

export const OidcProviderCard = ({
  oidcProvider,
  refetch,
}: {
  oidcProvider: TOidcProviderListItem;
  refetch: () => void;
}) => {
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative">
      <PopoverMenu
        className="absolute top-1 right-1"
        ariaLabel="OIDC Provider actions"
        options={[
          <ViewOidcProviderDrawer
            key="view-oidc-provider"
            oidcProviderName={oidcProvider.name}
          />,
          <SyncOidcProviderGroupsDrawer
            key="sync-oidc-provider-groups"
            oidcProviderName={oidcProvider.name}
          />,
          <UpdateOidcProviderDrawer
            key="edit-oidc-provider"
            oidcProvider={oidcProvider}
            refetch={refetch}
          />,
          <DeleteOidcProviderModal
            key="delete-oidc-provider"
            oidcProviderName={oidcProvider.name}
            refetch={refetch}
          />,
        ]}
      />

      <div className="flex flex-col items-center gap-2">
        <h3 className="font-medium">{oidcProvider.display_name}</h3>
      </div>
    </div>
  );
};
