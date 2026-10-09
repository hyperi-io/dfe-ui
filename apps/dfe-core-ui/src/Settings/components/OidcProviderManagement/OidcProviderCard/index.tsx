import { PopoverMenu } from '@/core/components/PopoverMenu';
import { Tooltip } from '@/core/components/Tooltip';
import { cn } from '@/core/utils/style';
import { DeleteOidcProviderModal } from '@/Settings/components/OidcProviderManagement/DeleteOidcProviderModal';
import { SyncOidcProviderGroupsDrawer } from '@/Settings/components/OidcProviderManagement/SyncOidcProviderGroupsDrawer';
import { TestOidcProviderModal } from '@/Settings/components/OidcProviderManagement/TestOidcProviderModal';
import { UpdateOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/UpdateOidcDrawer';
import { ViewOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/ViewOidcProviderDrawer';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { IconCapture, IconCaptureOff, IconCheck, IconX } from '@repo/dfe-icons';
import { Button } from 'antd';

const dataListTermStyle = 'text-foreground/50';
export const OidcProviderCard = ({
  oidcProvider,
}: {
  oidcProvider: TOidcProviderListItem;
}) => {
  // Only an api-mode provider has a directory to sync groups from.
  const canSyncGroups = oidcProvider.groups.mode === 'api';
  const enabledStatus = oidcProvider.enabled
    ? 'Provider is enabled'
    : 'Provider is disabled';

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
          ...(canSyncGroups
            ? [
                <SyncOidcProviderGroupsDrawer
                  key="sync-oidc-provider-groups"
                  oidcProvider={oidcProvider}
                />,
              ]
            : []),
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
        <h3 className="text-base font-medium flex items-center gap-2">
          <Tooltip destroyOnHidden title={enabledStatus} placement="top">
            <Button
              type="default"
              shape="circle"
              size="small"
              aria-label={enabledStatus}
              className={cn(
                'p-0.5',
                oidcProvider.enabled
                  ? 'text-success border-success bg-background dark:bg-dark-background'
                  : 'text-gray-500 border-gray-500 bg-background-muted dark:bg-dark-background-muted',
              )}
              icon={oidcProvider.enabled ? <IconCapture /> : <IconCaptureOff />}
            />
          </Tooltip>
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
          <dt className={dataListTermStyle}>Enrich on Login:</dt>
          <dd className="flex items-center gap-2">
            {oidcProvider.groups.enrich_on_login ? (
              <>
                <IconCheck />
                Yes
              </>
            ) : (
              <>
                <IconX />
                No
              </>
            )}
          </dd>
        </dl>
      </div>
    </div>
  );
};
