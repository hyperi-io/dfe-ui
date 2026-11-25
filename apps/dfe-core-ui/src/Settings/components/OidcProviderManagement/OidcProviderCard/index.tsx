import { PopoverMenu } from '@/core/components/PopoverMenu';
import { Tooltip } from '@/core/components/Tooltip';
import { formatDateXAgo } from '@/core/helpers/date.helpers';
import { groupModeLabel } from '@/core/helpers/oidcProviderFieldRules';
import { useAdministeredOrg } from '@/core/hooks/useAdministeredOrg';
import { cn } from '@/core/utils/style';
import { ProviderBadge } from '@/Settings/components/AccountManagement/ProviderBadge';
import { TAG_CLASS } from '@/Settings/components/GroupManagement/GroupCard/TagList';
import { DeleteOidcProviderModal } from '@/Settings/components/OidcProviderManagement/DeleteOidcProviderModal';
import {
  isReadAtLogin,
  OidcSyncStatusTag,
} from '@/Settings/components/OidcProviderManagement/OidcSyncStatusTag';
import { SyncOidcProviderGroupsDrawer } from '@/Settings/components/OidcProviderManagement/SyncOidcProviderGroupsDrawer';
import { TestOidcProviderModal } from '@/Settings/components/OidcProviderManagement/TestOidcProviderModal';
import { UpdateOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/UpdateOidcDrawer';
import { ViewOidcProviderDrawer } from '@/Settings/components/OidcProviderManagement/ViewOidcProviderDrawer';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { Tag } from 'antd';

export const OidcProviderCard = ({
  oidcProvider,
  readOnly = false,
}: {
  oidcProvider: TOidcProviderListItem;
  /** Leaves out the actions, for a view that points to the provider page to change one. */
  readOnly?: boolean;
}) => {
  const administeredOrg = useAdministeredOrg();
  // Only an api-mode provider has a directory to sync groups from, and the sync writes system groups an org admin may not.
  const canSyncGroups = oidcProvider.groups.mode === 'api' && !administeredOrg;

  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative h-full">
      {!readOnly && (
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
                    oidcProviderName={oidcProvider.name}
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
      )}

      <div className="flex flex-col items-center gap-2 text-center">
        <span className={cn('flex', !oidcProvider.enabled && 'opacity-40')}>
          <ProviderBadge
            label={`${oidcProvider.type} provider`}
            size="large"
            type={oidcProvider.type}
          />
        </span>
        <div className="flex flex-col items-center">
          <h3 className="flex flex-wrap items-center justify-center gap-2 font-medium break-words">
            {oidcProvider.display_name || oidcProvider.name}
            {!oidcProvider.enabled && <Tag className="m-0">Disabled</Tag>}
          </h3>
          <p className="text-xs text-foreground/50 dark:text-dark-foreground/50">
            {oidcProvider.name}
          </p>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-1">
          <li className={TAG_CLASS}>
            {groupModeLabel(oidcProvider.groups.mode)}
          </li>
          {oidcProvider.groups.enrich_on_login && (
            <li className={TAG_CLASS}>Enriched at login</li>
          )}
          {/* Read at login says all there is: nothing syncs, so there is no time to show. */}
          {isReadAtLogin(oidcProvider.last_sync_status) ? (
            <li className="flex">
              <OidcSyncStatusTag status={oidcProvider.last_sync_status} />
            </li>
          ) : (
            oidcProvider.last_sync_status && (
              <li>
                <Tooltip
                  destroyOnHidden
                  title={`Last sync ${formatDateXAgo(oidcProvider.last_sync_at)}`}
                >
                  <span className="flex">
                    <OidcSyncStatusTag status={oidcProvider.last_sync_status} />
                  </span>
                </Tooltip>
              </li>
            )
          )}
        </ul>
      </div>
    </div>
  );
};
