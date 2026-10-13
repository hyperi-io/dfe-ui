import { RbacProtected } from '@/core/components/RbacProtected';
import { useFetchInfiniteFilteredOidcProviders } from '@/Settings/hooks/oidcProviders/useFetchInfiniteFilteredOidcProviders';
import { AutoComplete, AutoCompleteProps } from 'antd';
import { useMemo } from 'react';

const SCROLL_LOAD_THRESHOLD = 4;
const SCIM_OPTION = { label: 'SCIM (scim)', value: 'scim' };

/** Free text, because a provider can also be an auth.source_provider_bindings entry or auth.proxy_provider, which no endpoint lists. */
export const GroupSourceProviderInput = (props: AutoCompleteProps<string>) => {
  const { isAuthorized: canListProviders } = RbacProtected.useRbac({
    action: RbacProtected.rbacActions.oidc_read,
  });
  const {
    data: { items: providers = [] },
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useFetchInfiniteFilteredOidcProviders({
    search: props.value?.trim(),
    enabled: canListProviders,
  });

  const search = props.value?.trim().toLowerCase() ?? '';

  const options = useMemo(
    () => [
      ...providers.map((provider) => ({
        label:
          provider.display_name && provider.display_name !== provider.name
            ? `${provider.display_name} (${provider.name})`
            : provider.name,
        value: provider.name,
      })),
      ...(SCIM_OPTION.value.includes(search) ? [SCIM_OPTION] : []),
    ],
    [providers, search],
  );

  const handlePopupScroll = (event: React.UIEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) return;
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    const isNearBottom =
      scrollTop + clientHeight >= scrollHeight - SCROLL_LOAD_THRESHOLD;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  return (
    <AutoComplete
      placeholder="Select or enter a provider"
      options={options}
      onPopupScroll={handlePopupScroll}
      {...props}
    />
  );
};
