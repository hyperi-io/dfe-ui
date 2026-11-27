import { GenericErrorCard } from '@/core/components/GenericError';
import { NotificationCard } from '@/core/components/NotificationCard';
import { CustomerProvidersCard } from '@/Settings/components/OidcProviderManagement/CustomerProvidersCard';
import { OidcProviderCard } from '@/Settings/components/OidcProviderManagement/OidcProviderCard';
import { PagedList } from '@/Settings/components/PagedList';
import { useFetchInfiniteFilteredOidcProviders } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders';
import type { TOidcProviderListItem } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';
import { useOrganisationLabels } from '@/Settings/hooks/organisations/useOrganisationLabels';
import { SHOW_ALL_PAGE_SIZE, useShowMore } from '@/Settings/hooks/useShowMore';
import { IconInfoCircle } from '@repo/dfe-icons';
import { Spin } from 'antd';

const CARD_GRID = 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4';

const byDisplayName = (a: TOidcProviderListItem, b: TOidcProviderListItem) =>
  (a.display_name || a.name).localeCompare(b.display_name || b.name);

const NO_MORE_PAGES = {
  fetchNextPage: () => Promise.resolve(),
  hasNextPage: false,
  isFetchingNextPage: false,
};

/** One section's sign-in providers: your organisation's as cards, or one card per customer organisation that opens to its providers. */
export const OidcProviderList = ({
  onOrgClosed,
  openOrg,
  scope,
  search = '',
}: {
  onOrgClosed?: () => void;
  /** A customer organisation whose providers open in their drawer as the list shows them. */
  openOrg?: string;
  scope: 'customer' | 'yours';
  search?: string;
}) => {
  // Providers number in the tens, so the list is read whole and searched here, organisation names included.
  const {
    data: { items: providers = [] },
    isLoading,
    error,
  } = useFetchInfiniteFilteredOidcProviders({ page_size: SHOW_ALL_PAGE_SIZE });
  const { isYours, orgLabel } = useOrganisationLabels();
  const paging = useShowMore();

  const term = search.trim().toLowerCase();
  const matches = (provider: TOidcProviderListItem) =>
    !term ||
    [
      provider.name,
      provider.display_name,
      ...(scope === 'customer' ? [provider.org, orgLabel(provider.org)] : []),
    ].some((value) => value?.toLowerCase().includes(term));

  const shown = providers
    .filter((provider) => isYours(provider.org) === (scope === 'yours'))
    .filter(matches)
    .sort(byDisplayName);
  const grouped = new Map<string, TOidcProviderListItem[]>();
  for (const provider of shown) {
    grouped.set(provider.org, [...(grouped.get(provider.org) ?? []), provider]);
  }
  // A linked organisation's card leads, so the slice before Show more always holds it.
  const orgCards = [...grouped.entries()]
    .map(([org, held]) => ({ held, org }))
    .sort(
      (a, b) =>
        Number(b.org === openOrg) - Number(a.org === openOrg) ||
        orgLabel(a.org).localeCompare(orgLabel(b.org)),
    );
  const providerView = paging.view({ ...NO_MORE_PAGES, items: shown });
  const orgView = paging.view({ ...NO_MORE_PAGES, items: orgCards });

  if (isLoading) {
    return (
      <>
        <Spin /> <p className="sr-only">Loading OIDC providers</p>
      </>
    );
  }
  if (error) {
    return (
      <GenericErrorCard
        title="Error fetching OIDC providers"
        description={error.message}
      />
    );
  }
  if (shown.length === 0) {
    return (
      <NotificationCard
        className="w-full"
        description={
          scope === 'yours'
            ? 'No OIDC providers found'
            : 'No customer OIDC providers found'
        }
        icon={<IconInfoCircle />}
      />
    );
  }

  return (
    <PagedList
      hasMore={(scope === 'yours' ? providerView : orgView).hasMore}
      loading={false}
      onLoadMore={() => {}}
      onShowMore={paging.showMore}
      scrolling={paging.scrolling}
    >
      <ul className={CARD_GRID}>
        {scope === 'yours'
          ? providerView.visible.map((provider) => (
              <li key={provider.name}>
                <OidcProviderCard oidcProvider={provider} />
              </li>
            ))
          : orgView.visible.map(({ held, org }) => (
              <li key={org}>
                <CustomerProvidersCard
                  defaultOpen={org === openOrg}
                  label={orgLabel(org)}
                  onClose={onOrgClosed}
                  org={org}
                  providers={held}
                />
              </li>
            ))}
      </ul>
    </PagedList>
  );
};
