/* eslint-disable no-restricted-imports */
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
};
/* eslint-enable no-restricted-imports */
