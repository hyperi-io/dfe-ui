import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { RbacProtected } from '@/core/components/RbacProtected';
import { OidcProviderCard } from '@/Settings/components/OidcProviderManagement/OidcProviderCard';
import { useFetchInfiniteFilteredOidcProviders } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders';
import { useIsYourOrg } from '@/Settings/hooks/organisations/useOrganisationLabels';
import { SHOW_ALL_PAGE_SIZE } from '@/Settings/hooks/useShowMore';
import { IconChevronRight, IconInfoCircle } from '@repo/dfe-icons';
import { Input, Spin } from 'antd';
import Link from 'next/link';
import { useState } from 'react';

/** One organisation's providers as cards with a search, and an optional link to where they are managed. */
export const OrgOidcProviders = ({
  manageHref,
  org,
  readOnly = false,
}: {
  manageHref?: string;
  org: string;
  /** Shows the cards without their actions, so a change goes through the provider page. */
  readOnly?: boolean;
}) => {
  const [search, setSearch] = useState('');
  // Providers number in the tens, so the list is read whole, as the provider page reads it.
  const {
    data: { items: providers = [] },
    isLoading,
    error,
  } = useFetchInfiniteFilteredOidcProviders({ page_size: SHOW_ALL_PAGE_SIZE });
  const isYours = useIsYourOrg();
  const term = search.trim().toLowerCase();
  // Your organisation's providers include the platform ones, which name no organisation.
  const held = providers
    .filter((provider) =>
      isYours(org) ? isYours(provider.org) : provider.org === org,
    )
    .filter(
      (provider) =>
        !term ||
        [provider.name, provider.display_name].some((value) =>
          value.toLowerCase().includes(term),
        ),
    )
    .sort((a, b) =>
      (a.display_name || a.name).localeCompare(b.display_name || b.name),
    );

  return (
    <RbacProtected action={RbacProtected.rbacActions.oidc_read}>
      <RbacProtected.Unrestricted>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            {manageHref && (
              <Link
                href={manageHref}
                className="flex items-center gap-1 text-sm text-tertiary! hover:underline"
              >
                Manage OIDC providers
                <IconChevronRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
            <Input.Search
              className="ml-auto w-60"
              placeholder="Search providers"
              onChange={(e) => setSearch(e.target.value)}
              value={search}
              allowClear
            />
          </div>
          {isLoading && (
            <span>
              <Spin /> <span className="sr-only">Loading OIDC providers</span>
            </span>
          )}
          {error && (
            <GenericErrorCard
              title="Error fetching OIDC providers"
              description={error.message}
            />
          )}
          {!isLoading && !error && held.length === 0 && (
            <NotificationCard
              className="w-full"
              description="No OIDC providers found"
              icon={<IconInfoCircle />}
            />
          )}
          {held.length > 0 && (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {held.map((provider) => (
                <li key={provider.name}>
                  <OidcProviderCard
                    oidcProvider={provider}
                    readOnly={readOnly}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
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
  );
};
