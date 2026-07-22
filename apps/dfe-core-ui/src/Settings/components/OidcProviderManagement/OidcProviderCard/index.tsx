import { PopoverMenu } from '@/core/components/PopoverMenu';
import { DeleteOidcProviderModal } from '@/Settings/components/OidcProviderManagement/DeleteOidcProviderModal';
import { SyncOidcProviderGroupsDrawer } from '@/Settings/components/OidcProviderManagement/SyncOidcProviderGroupsDrawer';
import { TestOidcProviderModal } from '@/Settings/components/OidcProviderManagement/TestOidcProviderModal';
import { UpdateOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/UpdateOidcDrawer';
import { ViewOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/ViewOidcProviderDrawer';
import { TOidcProviderListItem } from '@/Settings/hooks/useFetchInfiniteFilteredOidcProviders/types';

const dataListTermStyle = 'text-foreground/50';
export const OidcProviderCard = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative">
      <PopoverMenu
        className="absolute top-1 right-1"
        ariaLabel="OIDC Provider actions"
        options={[
          <ViewOidcProviderDrawer
            key="view-oidc-provider"
            oidcProvider={oidcProvider}
          />,
          <TestOidcProviderModal
            key="test-oidc-provider"
            oidcProviderName={oidcProvider.name}
          />,
          <SyncOidcProviderGroupsDrawer
            key="sync-oidc-provider-groups"
            oidcProviderName={oidcProvider.name}
          />,
          <UpdateOidcProviderDrawer
            key="edit-oidc-provider"
            oidcProvider={oidcProvider}
          />,
          <DeleteOidcProviderModal
            key="delete-oidc-provider"
            oidcProviderName={oidcProvider.name}
          />,
        ]}
      />

      <div className="flex flex-col gap-2">
        <h3 className="text-base font-medium flex items-center">
          {oidcProvider.display_name}
          <span className="text-sm text-foreground/50 ml-1">
            ({oidcProvider.name})
          </span>
        </h3>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className={dataListTermStyle}>Type:</dt>
          <dd>{oidcProvider.type}</dd>
          <dt className={dataListTermStyle}>Mode:</dt>
          <dd>{oidcProvider.groups.mode}</dd>
        </dl>
      </div>
    </div>
  );
};
