import { Drawer } from '@/core/components/Drawer';
import { PopoverMenu } from '@/core/components/PopoverMenu';
import { ProviderBadge } from '@/Settings/components/AccountManagement/ProviderBadge';
import { TAG_CLASS } from '@/Settings/components/GroupManagement/GroupCard/TagList';
import { OrgOidcProviders } from '@/Settings/components/OidcProviderManagement/OrgOidcProviders';
import { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { IconEye } from '@repo/dfe-icons';
import { Button } from 'antd';
import { useState } from 'react';

/** One customer organisation's providers as a single card, so an organisation with many takes one place in the list. Its drawer of every provider sits outside the menu, so a link can open it on arrival. */
export const CustomerProvidersCard = ({
  defaultOpen = false,
  label,
  onClose,
  org,
  providers,
}: {
  /** Opens the drawer as the card mounts, for a link that names the organisation. */
  defaultOpen?: boolean;
  /** The organisation's display name. */
  label: string;
  onClose?: () => void;
  org: string;
  providers: readonly TOidcProviderListItem[];
}) => {
  const [open, setOpen] = useState(defaultOpen);
  const types = [...new Set(providers.map((provider) => provider.type))];
  const close = () => {
    setOpen(false);
    onClose?.();
  };
  return (
    <div className="rounded-md p-4 border border-foreground/10 dark:border-dark-foreground/10 relative h-full">
      <PopoverMenu
        className="absolute top-1 right-1"
        ariaLabel={`${label} actions`}
        options={[
          <Button
            key="view-customer-providers"
            type="text"
            aria-label={`View ${label} OIDC providers`}
            icon={<IconEye />}
            onClick={() => setOpen(true)}
          >
            View OIDC Providers
          </Button>,
        ]}
      />
      <Drawer
        title={`${label} OIDC Providers`}
        open={open}
        onClose={close}
        size="60%"
        // Nothing here is edited, so there is nothing to lose by clicking away.
        preventClickaway={{ enabled: false }}
      >
        <OrgOidcProviders org={org} />
      </Drawer>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-brand-primary dark:bg-secondary">
          <p className="text-white text-sm">{label.charAt(0).toUpperCase()}</p>
        </span>
        <div className="flex flex-col items-center">
          <h3 className="font-medium break-words">{label}</h3>
          <p className="text-xs text-foreground/50 dark:text-dark-foreground/50">
            {org}
          </p>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-1">
          <li className={TAG_CLASS}>
            {`${providers.length} ${providers.length === 1 ? 'provider' : 'providers'}`}
          </li>
          {types.map((type) => (
            <li key={type} className="flex">
              <ProviderBadge label={`${type} provider`} type={type} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
