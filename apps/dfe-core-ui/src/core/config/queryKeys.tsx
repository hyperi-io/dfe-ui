/* eslint-disable no-restricted-imports */
import { useFetchInfiniteFilteredAccountsProps } from '@/Settings/hooks/accounts/useFetchInfiniteFilteredAccounts/types';
import { UseFetchInfiniteFilteredOidcProvidersProps } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders/types';

export const QUERY_KEYS = {
  oidcProviders: {
    infiniteFiltered: ({
      search,
      sort_by,
      sort_order,
      page,
      per_page,
    }: UseFetchInfiniteFilteredOidcProvidersProps = {}) => [
      'oidc-providers',
      ...(search ? [search] : []),
      ...(sort_by ? [sort_by] : []),
      ...(sort_order ? [sort_order] : []),
      ...(page ? [page] : []),
      ...(per_page ? [per_page] : []),
    ],
  },
  accounts: {
    me: () => ['current-user', 'me'],
    infiniteFiltered: ({
      search,
      blocked,
      include_core,
      sort_by,
      sort_order,
      page,
      per_page,
    }: useFetchInfiniteFilteredAccountsProps = {}) => [
      'accounts',
      ...(search ? [search] : []),
      ...(blocked !== undefined ? [blocked] : []),
      ...(include_core ? [include_core] : []),
      ...(sort_by ? [sort_by] : []),
      ...(sort_order ? [sort_order] : []),
      ...(page ? [page] : []),
      ...(per_page ? [per_page] : []),
    ],
  },
  system: {
    retention: () => ['system-retention'],
  },
};
/* eslint-enable no-restricted-imports */
